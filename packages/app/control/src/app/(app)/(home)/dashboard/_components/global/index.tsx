import { Section } from '../utils';

import { LoadingPopularApps, PopularApps } from './popular';

export const GlobalSection = () => {
  return (
    <Section title="Explore">
      <PopularApps />
    </Section>
  );
};

export const LoadingGlobalSection = () => {
  return (
    <Section title="Explore">
      <LoadingPopularApps />
    </Section>
  );
};
