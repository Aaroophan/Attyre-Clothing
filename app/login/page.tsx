import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth';
import { PageContainer, LoadingState } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your Attyre customer or admin account.',
};

export default function LoginPage() {
  return (
    <PageContainer className="section-space">
      <Suspense fallback={<LoadingState label="Loading login form..." />}>
        <LoginForm />
      </Suspense>
    </PageContainer>
  );
}
