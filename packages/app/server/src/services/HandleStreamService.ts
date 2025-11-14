import { Response as ExpressResponse } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web';
import { ReadableStream } from 'stream/web';
import { ok, err } from 'neverthrow';
import { AppResult, StreamError, ValidationError } from '../errors';
import logger from '../logger';
import { BaseProvider } from '../providers/BaseProvider';
import { Transaction } from '../types';
import { Request } from 'express';

class HandleStreamService {
  /**
   * Duplicates a stream into two independent streams
   * @param stream - The original stream to duplicate
   * @returns A tuple of two independent streams
   */
  private duplicateStream(
    stream: ReadableStream<Uint8Array>
  ): [ReadableStream<Uint8Array>, ReadableStream<Uint8Array>] {
    return stream.tee();
  }

  /**
   * Handles streaming response from the model provider
   * Streams data to the client while simultaneously processing it for accounting
   * @param response - The fetch response from the model provider
   * @param provider - The provider instance for handling the response
   * @param res - Express response object to stream data to the client
   */
  async handleStream(
    response: Response,
    provider: BaseProvider,
    req: Request,
    res: ExpressResponse
  ): Promise<Transaction> {
    const bodyStream = response.body as ReadableStream<Uint8Array>;
    if (!bodyStream) {
      logger.error('No body stream returned from API');
      throw new Error('No body stream returned from API');
    }

    const [clientStream, accountingStream] = this.duplicateStream(bodyStream);

    const streamToClientPromise = this.streamToClient(clientStream, res);

    const reader2 = accountingStream.getReader();
    const transactionPromise = this.processStreamData(
      req,
      reader2 as ReadableStreamDefaultReader<Uint8Array>,
      provider
    );

    const [_, transaction] = await Promise.all([
      streamToClientPromise,
      transactionPromise,
    ]);
    
    return transaction;
  }

  /**
   * Streams data directly to the client
   * @param reader - The stream reader for client data
   * @param res - Express response object
   */
  private async streamToClient(
    stream: NodeWebReadableStream<Uint8Array>,
    res: ExpressResponse
  ): Promise<void> {
    await pipeline(Readable.fromWeb(stream), res);
  }

  /**
   * Processes stream data for accounting and transaction creation
   * @param reader - The stream reader for processing data
   * @param provider - The provider instance for handling the response
   */
  private async processStreamData(
    req: Request,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    provider: BaseProvider
  ): Promise<Transaction> {
    let data = '';
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      data += decoder.decode(value, { stream: true });
    }

    data += decoder.decode();
    
    return await provider.handleBody(data, req.body);
  }
}

export const handleStreamService = new HandleStreamService();
