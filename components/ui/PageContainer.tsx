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
    <Component className={cn('container-max', className)}>
      {children}
    </Component>
  );
}
