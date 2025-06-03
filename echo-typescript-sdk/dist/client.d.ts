import { EchoConfig } from './config';
import { Balance, CreatePaymentLinkRequest, CreatePaymentLinkResponse, EchoApp } from './types';
export declare class EchoClient {
    private http;
    private config;
    constructor(config?: Partial<EchoConfig>);
    /**
     * Get current balance for the authenticated user
     * @param echoAppId Optional app ID to get balance for specific app
     */
    getBalance(echoAppId?: string): Promise<Balance>;
    /**
     * Create a payment link for purchasing credits
     * @param request Payment link details
     */
    createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse>;
    /**
     * Get payment URL for purchasing credits
     * @param amount Amount to purchase in USD
     * @param echoAppId App ID to associate the purchase with
     * @param description Optional description for the payment
     */
    getPaymentUrl(amount: number, echoAppId: string, description?: string): Promise<string>;
    /**
     * Get app URL for a specific Echo app
     * @param appId The Echo app ID
     */
    getAppUrl(appId: string): string;
    /**
     * List all Echo apps for the authenticated user
     */
    listEchoApps(): Promise<EchoApp[]>;
    /**
     * Get a specific Echo app by ID
     * @param appId The Echo app ID
     */
    getEchoApp(appId: string): Promise<EchoApp>;
    private handleError;
}
//# sourceMappingURL=client.d.ts.map