import {
    createGroq as createGroqBase,
    GroqProvider,
} from '@ai-sdk/groq';
import { ROUTER_BASE_URL } from 'config';
import { echoFetch } from './index';
import { EchoConfig } from '../types';

export function createEchoGroq(
    { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
    getTokenFn: (appId: string) => Promise<string | null>,
    onInsufficientFunds?: () => void
): GroqProvider {
    return createGroqBase({
        baseURL: baseRouterUrl,
        apiKey: 'placeholder_replaced_by_echoFetch',
        fetch: echoFetch(
            fetch,
            async () => await getTokenFn(appId),
            onInsufficientFunds
        ),
    });
}