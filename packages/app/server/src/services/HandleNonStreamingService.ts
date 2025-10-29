import { Response as ExpressResponse, Request } from 'express';
import { BaseProvider } from '../providers/BaseProvider';
import { Transaction } from '../types';
import { ResultAsync, fromPromise, err } from 'neverthrow';

export class HandleNonStreamingService {
  /**
   * Handles non-streaming response from the model provider
   * Processes the response and sends it to the client
   * @param response - The fetch response from the model provider
   * @param provider - The provider instance for handling the response
   * @param res - Express response object to send data to the client
   */
  handleNonStreaming(
    response: Response,
    provider: BaseProvider,
    req: Request,
    res: ExpressResponse
  ): ResultAsync<{ transaction: Transaction; data: unknown }, Error> {
    // Parse the JSON response with error handling
    return fromPromise(
      response.json(),
      error => new Error(`Failed to parse JSON response: ${error}`)
    )
      .orElse(jsonError => {
        // If JSON parsing fails, get the text response instead
        return fromPromise(
          response.text(),
          error => new Error(`Failed to read response text: ${error}`)
        ).andThen(text => {
          return err(new Error(`Failed to parse JSON response: ${text}`));
        });
      })
      .andThen(data => {
        // Apply provider-specific response transformations (e.g., signed URLs)
        return fromPromise(
          provider.transformResponse(data),
          error => new Error(`Failed to transform response: ${error}`)
        ).andThen(transformedData => {
          // Process the response body for accounting/transaction creation
          return fromPromise(
            provider.handleBody(JSON.stringify(transformedData), req.body),
            error => new Error(`Failed to handle body: ${error}`)
          ).map(transaction => {
            // Set the appropriate content type
            res.setHeader('content-type', 'application/json');

            return { transaction, data: transformedData };
          });
        });
      });
  }
}

// Export singleton instance
export const handleNonStreamingService = new HandleNonStreamingService();
