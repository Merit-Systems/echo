import { Response as ExpressResponse } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web';
import { ReadableStream } from 'stream/web';
import { ResultAsync, fromPromise, err } from 'neverthrow';
import logger from '../logger';
import { BaseProvider } from '../providers/BaseProvider';
import { Transaction } from '../types';
import { Request } from 'express';

export class HandleStreamService {
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
  handleStream(
    response: Response,
    provider: BaseProvider,
    req: Request,
    res: ExpressResponse
  ): ResultAsync<Transaction, Error> {
    const bodyStream = response.body as ReadableStream<Uint8Array>;
    if (!bodyStream) {
      return fromPromise(
        Promise.reject(new Error('No body stream returned from API')),
        error => error as Error
      );
    }

    // Duplicate the stream - one for client, one for processing
    const [clientStream, accountingStream] = this.duplicateStream(bodyStream);

    // Promise for streaming data to client
    const streamToClientResult = this.streamToClient(clientStream, res);

    // Promise for processing data and creating transaction
    const reader2 = accountingStream.getReader();
    const transactionResult = this.processStreamData(
      req,
      reader2 as ReadableStreamDefaultReader<Uint8Array>,
      provider
    );

    // Wait for both streams to complete before ending response
    return streamToClientResult
      .andThen(() => {
        return transactionResult;
      })
      .orElse(error => {
        logger.error(`Error in stream coordination: ${error}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream processing failed' });
        }
        return err(error);
      });
  }

  /**
   * Streams data directly to the client
   * @param reader - The stream reader for client data
   * @param res - Express response object
   */
  private streamToClient(
    stream: NodeWebReadableStream<Uint8Array>,
    res: ExpressResponse
  ): ResultAsync<void, Error> {
    return fromPromise(
      pipeline(Readable.fromWeb(stream), res),
      error => new Error(`Failed to stream data to client: ${error}`)
    );
  }

  /**
   * Processes stream data for accounting and transaction creation
   * @param reader - The stream reader for processing data
   * @param provider - The provider instance for handling the response
   */
  private processStreamData(
    req: Request,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    provider: BaseProvider
  ): ResultAsync<Transaction, Error> {
    let data = '';
    const decoder = new TextDecoder();

    const readStream = async (): Promise<Transaction> => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        data += decoder.decode(value, { stream: true });
      }
      // flush any remaining decoder state
      data += decoder.decode();
      // Wait for transaction to complete before resolving
      return await provider.handleBody(data, req.body);
    };

    return fromPromise(
      readStream(),
      error => new Error(`Error processing stream: ${error}`)
    ).orElse(error => {
      logger.error(`Error processing stream: ${error}`);
      return err(error);
    });
  }
}

// Export singleton instance
export const handleStreamService = new HandleStreamService();
