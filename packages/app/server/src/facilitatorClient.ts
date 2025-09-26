import { SettleRequest, SettleResponse, VerifyRequest, VerifyResponse } from "types";

export class FacilitatorClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        console.log('FacilitatorClient constructor', baseUrl);
        this.baseUrl = baseUrl;
    }

    async verify(request: VerifyRequest): Promise<VerifyResponse> {
        return this.post<VerifyResponse>('/verify', request);
    }

    async settle(request: SettleRequest): Promise<SettleResponse> {
        return this.post<SettleResponse>('/settle', request);
    }

    private async post<T>(path: string, body: unknown): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            console.log('FacilitatorClient post', res.statusText, text);
            console.log('FacilitatorClient post', res.status);
            console.log(res.body);
            throw new Error(`Facilitator API Error: ${res.status} ${res.statusText}\n${text}`);
        }

        return res.json();
    }

}