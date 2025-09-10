import React from 'react';

import {
  Table as TableBase,
  TableHeader,
  TableCell as TableCellBase,
  TableRow,
  TableHead as TableHeadBase,
  TableBody,
  TableEmpty,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Props {
  Icon: LucideIcon;
  columns: string[];
  children: React.ReactNode;
}

export const Table: React.FC<Props> = ({ Icon, columns, children }) => {
  const TableHead = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <TableHeadBase
        className={cn('text-xs text-muted-foreground/60 h-fit pb-2', className)}
      >
        {children}
      </TableHeadBase>
    );
  };

  return (
    <TableBase className="mb-2">
      <TableHeader>
        <TableRow className="hover:bg-transparent text-xs">
          <TableHead className="pl-4 flex items-center gap-2">
            <div className="size-8 flex items-center justify-center bg-muted rounded-md">
              <Icon className="size-4" />
            </div>
            {columns[0]}
          </TableHead>
          {columns.slice(1, columns.length - 1).map(column => (
            <TableHead key={column} className="text-center">
              {column}
            </TableHead>
          ))}
          <TableHead className="text-right pr-4">
            {columns[columns.length - 1]}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </TableBase>
  );
};

export const TableCell = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <TableCellBase
      className={cn('text-center text-xs text-muted-foreground', className)}
    >
      {children}
    </TableCellBase>
  );
};

export const EmptyTableRow = ({ children }: { children: string }) => {
  return <TableEmpty colSpan={4}>{children}</TableEmpty>;
};
