import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }) {
  return (
    <table className={cn('min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm', className)} {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead className={cn('bg-background dark:bg-background', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn('divide-y divide-gray-100 dark:divide-gray-800', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr className={cn('even:bg-background dark:even:bg-background/50', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <th scope="col" className={cn('px-4 py-2 text-left text-xs font-medium text-foreground uppercase tracking-wider', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('px-4 py-2', className)} {...props}>
      {children}
    </td>
  );
}

export default Table;
