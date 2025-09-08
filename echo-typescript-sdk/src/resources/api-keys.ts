import { HttpClient } from '../http-client';
import {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ListApiKeysResponse,
} from '../types';
import { BaseResource } from '../utils/error-handling';

export class ApiKeysResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async create(
    echoAppId: string,
    name?: string
  ): Promise<CreateApiKeyResponse> {
    const body: CreateApiKeyRequest = { echoAppId, ...(name && { name }) };
    return this.handleRequest(
      () => this.http.post(`/api/v1/apps/${echoAppId}/api-keys`, body),
      'creating API key',
      `/api/v1/apps/${echoAppId}/api-keys`
    );
  }

  async list(echoAppId: string): Promise<ListApiKeysResponse> {
    return this.handleRequest(
      () => this.http.get(`/api/v1/apps/${echoAppId}/api-keys`),
      'listing API keys',
      `/api/v1/apps/${echoAppId}/api-keys`
    );
  }
}
