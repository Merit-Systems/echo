import type { Request, Response, NextFunction } from "express";
import { alvaroInferenceCostEstimation } from "../utils";
import { USDC_ADDRESS } from "../services/fund-repo/constants";
import { Network, paymentMiddleware } from "x402-express";
import { getSmartAccount } from "../utils";

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

        return paymentMiddleware(
            payTo,
            routes,
            { url: process.env.FACILITATOR_URL as `${string}://${string}` },
            {
                cdpClientKey: process.env.CDP_CLIENT_KEY!,
                appName: 'Echo',
            }
        )(req, res, next);
    }
}