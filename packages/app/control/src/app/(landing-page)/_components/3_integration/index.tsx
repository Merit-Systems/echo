import { Section } from '../lib/section';
import {
  Tabs,
  TabsTrigger,
  TabsList,
  TabsContent,
  TabsContents,
} from '@/components/ui/shadcn-io/tabs';
import { integrations } from './data';
import { Card } from '@/components/ui/card';
import { Code } from '@/components/ui/code';
import { Book, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const IntegrationSection = () => {
  return (
    <Section id="integration">
      <div className="p-4 md:p-8 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-center">
            Start Earning in Seconds
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Our SDKs are designed to minimize the time from idea to revenue
          </p>
        </div>
        <Tabs
          className="flex flex-col items-center gap-4 justify-center w-full"
          defaultValue="Next.js"
        >
          <TabsList className="flex items-center gap-2">
            {integrations.map(integration => (
              <TabsTrigger
                key={integration.name}
                value={integration.name}
                className="flex items-center gap-2"
              >
                {integration.icon} {integration.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContents className="w-full">
            {integrations.map(integration => (
              <TabsContent key={integration.name} value={integration.name}>
                <Card
                  key={integration.name}
                  className="flex flex-col md:flex-row w-full overflow-hidden"
                >
                  <div className="flex flex-col justify-center p-4 gap-4 bg-muted/50 border-r flex-1">
                    <div className="flex flex-col justify-center">
                      <h1 className="text-2xl font-bold">{integration.name}</h1>
                      <p className="text-sm text-muted-foreground">
                        LLM billing made easy in {integration.name}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                      {[
                        'Serve LLM Inference risk-free',
                        "Monitor your users' balances and usage",
                        'Sponsor free tier for new users',
                      ].map(feature => (
                        <div key={feature} className="flex gap-2 items-center">
                          <Check className="size-4 text-green-600" />
                          <p
                            key={feature}
                            className="text-sm text-muted-foreground"
                          >
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Link href={integration.href}>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Book className="size-4" />
                        Learn More
                      </Button>
                    </Link>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <Code value={integration.content} lang="tsx" />
                  </div>
                </Card>
              </TabsContent>
            ))}
          </TabsContents>
        </Tabs>
      </div>
    </Section>
  );
};
