import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth';
import { PageContainer, LoadingState } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Create Customer Account',
  description: 'Create an Attyre customer account for order history and tracking.',
};

export default function RegisterPage() {
  return (
    <PageContainer className="section-space">
      <Suspense fallback={<LoadingState label="Loading registration form..." />}>
        <RegisterForm />
      </Suspense>
    </PageContainer>
  );
}
