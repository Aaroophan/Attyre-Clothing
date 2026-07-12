import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main';
}

export function PageContainer({
  children,
  className,
  as: Component = 'div',
}: PageContainerProps) {
  return (
    <Component className={cn('p-5 max-w-[90vw] mx-auto', className)}>
      {children}
    </Component>
  );
}
