import { cn } from '@/lib/utils';
import * as React from 'react';

export type LabelProps = React.ComponentProps<'label'>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-sm font-medium leading-none text-foreground', className)}
      {...props}
    />
  );
}
