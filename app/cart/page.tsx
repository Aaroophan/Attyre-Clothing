import type { Metadata } from 'next';
import { CartPageClient } from '@/components/cart/CartPageClient';
import { PageContainer, SectionHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review selected Attyre products before Cash on Delivery checkout.',
};

export default function CartPage() {
  return (
    <PageContainer className="py-10 md:py-14">
      <SectionHeader
        eyebrow="Shopping cart"
        title="Review your selected items"
        description="Update quantities, remove products, and check the total before continuing to Cash on Delivery checkout."
        actionLabel="Continue shopping"
        actionHref="/shop"
      />
      <CartPageClient />
    </PageContainer>
  );
}
