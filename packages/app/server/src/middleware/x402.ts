import type { Request, Response, NextFunction } from "express";
import { alvaroInferenceCostEstimation } from "../utils";
import { USDC_ADDRESS } from "../services/fund-repo/constants";
import { Network, paymentMiddleware } from "x402-express";
import { getSmartAccount } from "../utils";
import { generateJwt } from "@coinbase/cdp-sdk/auth";

export function x402DynamicPricingMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('x402DynamicPricingMiddleware');
        const amount = alvaroInferenceCostEstimation();
        const network = process.env.NETWORK as Network;

        console.log('req', req.headers);

        const routes = {
            [`${req.method.toUpperCase()} ${req.path}`]: {
                price: {
                    amount,
                    asset: {
                        address: USDC_ADDRESS,
                        decimals: 6,
                        eip712: { name: 'USD Coin', version: '2'}
                    },
                },
                network,
                config: {
                    description: 'Echo x402',
                    mimeType: 'application/json',
                    maxTimeoutSeconds: 1000,
                    discoverable: true,
                }
            }
        }

        const payTo = (await getSmartAccount()).smartAccount.address;

        console.log("facilitator base url", process.env.FACILITATOR_BASE_URL);

        const base = new URL(process.env.FACILITATOR_BASE_URL!); // e.g. https://api.cdp.coinbase.com/platform/v2/x402
        const host = base.host;
        const baseUrl = `${base.origin}${base.pathname}`;

        const createAuthHeaders = async () => {
            const verifyJwt = await generateJwt({
              apiKeyId: process.env.CDP_API_KEY_ID!,
              apiKeySecret: process.env.CDP_API_KEY_SECRET!,
              requestMethod: 'POST',
              requestHost: host,
              requestPath: `${base.pathname}/verify`,
              expiresIn: 120_000,
            });
            const settleJwt = await generateJwt({
              apiKeyId: process.env.CDP_API_KEY_ID!,
              apiKeySecret: process.env.CDP_API_KEY_SECRET!,
              requestMethod: 'POST',
              requestHost: host,
              requestPath: `${base.pathname}/settle`,
              expiresIn: 120_000,
            });
            return {
              verify: { Authorization: `Bearer ${verifyJwt}` },
              settle: { Authorization: `Bearer ${settleJwt}` },
              supported: {},
              list: {},
            };
          };

        return paymentMiddleware(
            payTo,
            routes,
            { url: baseUrl as `${string}://${string}`, createAuthHeaders },
            {
                cdpClientKey: process.env.CDP_CLIENT_KEY!,
                appName: 'Echo',
            }
        )(req, res, next);
    }
}