import React from 'react';

interface TableLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function TableLayout({
  title,
  description,
  children,
}: TableLayoutProps) {
  return (
    <div className="container mx-auto space-y-8 w-[80%]">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description ? (
          <p className="text-muted-foreground mt-2">{description}</p>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}
