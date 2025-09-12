import { Section } from '../lib/section';
import {
  FeatureCard,
  FeatureCardComponent,
  FeatureCardDescription,
  FeatureCardFooter,
  FeatureCardTitle,
} from './feature-card';

import { AnyModel } from './features/any-model';
import { Billing } from './features/billing';
import { UniversalBalance } from './features/universal-balance';

import { cn } from '@/lib/utils';

export const Features = () => {
  return (
    <Section id="features">
      <div className={cn('grid md:grid-cols-3')}>
        <FeatureCard>
          <FeatureCardComponent>
            <Billing />
          </FeatureCardComponent>
          <FeatureCardFooter>
            <FeatureCardTitle>Billing in a Box</FeatureCardTitle>
            <FeatureCardDescription>
              Every token your users consume is profit in your pocket
            </FeatureCardDescription>
          </FeatureCardFooter>
        </FeatureCard>
        <FeatureCard>
          <FeatureCardComponent>
            <UniversalBalance />
          </FeatureCardComponent>
          <FeatureCardFooter>
            <FeatureCardTitle>Universal Balance</FeatureCardTitle>
            <FeatureCardDescription>
              Echo credits can be used on any app in our network
            </FeatureCardDescription>
          </FeatureCardFooter>
        </FeatureCard>
        <FeatureCard>
          <FeatureCardComponent>
            <AnyModel />
          </FeatureCardComponent>
          <FeatureCardFooter>
            <FeatureCardTitle>Any Model Provider</FeatureCardTitle>
            <FeatureCardDescription>
              Serve any model with maximum rate limits and minimum latency
            </FeatureCardDescription>
          </FeatureCardFooter>
        </FeatureCard>
      </div>
    </Section>
  );
};
