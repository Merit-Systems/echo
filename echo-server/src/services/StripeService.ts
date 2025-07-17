import Stripe from 'stripe';
import { EchoDbService } from './DbService';
import { User } from '../types';

const LLM_TOKEN_USAGE_METERED_EVENT_NAME = 'llm_token_usage';

export class StripeService {
  private stripe: Stripe;
  private dbService: EchoDbService;
  private user: User;

  constructor(dbService: EchoDbService, user: User) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'test_secret_stripe_key',
      {
        apiVersion: '2025-05-28.basil',
      }
    );
    this.dbService = dbService;
    this.user = user;
  }

  async getOrCreateLLMTokenBillingMeter(
    appId: string
  ): Promise<{ billingMeter: Stripe.Billing.Meter; billingMeterId: string }> {
    const app = await this.dbService.getEchoApp(appId);

    if (!app) {
      throw new Error('App not found');
    }

    let billingMeter = null;
    let billingMeterId = null;

    if (!app.stripeTokenBillingMeterId) {
      billingMeter = await this.stripe.billing.meters.create({
        display_name: `LLM Token Usage - ${appId}`,
        event_name: LLM_TOKEN_USAGE_METERED_EVENT_NAME + '_' + appId,
        default_aggregation: {
          formula: 'sum',
        },
        value_settings: {
          event_payload_key: 'value',
        },
        customer_mapping: {
          type: 'by_id',
          event_payload_key: 'stripe_customer_id',
        },
      });
      billingMeterId = billingMeter.id;

      await this.dbService.db.echoApp.update({
        where: { id: appId },
        data: {
          stripeTokenBillingMeterId: billingMeterId,
        },
      });
    } else {
      billingMeter = await this.stripe.billing.meters.retrieve(
        app.stripeTokenBillingMeterId
      );
      billingMeterId = app.stripeTokenBillingMeterId;
    }

    return {
      billingMeter,
      billingMeterId,
    };
  }

  async recordMeterUsage(appId: string, amount: number, model: string) {
    if (!this.user.stripeCustomerId) {
      throw new Error('User does not have a stripe customer id');
    }

    const meterEvent = await this.stripe.billing.meterEvents.create({
      event_name: LLM_TOKEN_USAGE_METERED_EVENT_NAME + '_' + appId,
      payload: {
        value: amount.toString(),
        stripe_customer_id: this.user.stripeCustomerId,
        model: model,
      },
    });

    return meterEvent;
  }
}
