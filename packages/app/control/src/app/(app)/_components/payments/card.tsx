import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const PaymentsCard: React.FC<Props> = ({ title, children }) => {
  return (
    <Card className="bg-transparent">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
};
