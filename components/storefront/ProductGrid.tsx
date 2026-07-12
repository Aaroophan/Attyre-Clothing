import { EmptyState } from '@/components/ui';
import { ProductCard } from './ProductCard';

export interface ShopProductCardData {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  image: string;
  price: number;
  salePrice?: number;
  stock: number;
}

export interface ProductGridProps {
  products: ShopProductCardData[];
  hasFilters: boolean;
}

export function ProductGrid({ products, hasFilters }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={hasFilters ? 'No products match your filters' : 'No products yet'}
        description={
          hasFilters
            ? 'Try clearing the search term, changing the category, or choosing another sort option.'
            : 'Products will appear after running the seed script.'
        }
        actionLabel={hasFilters ? 'Clear filters' : 'Back to home'}
        actionHref={hasFilters ? '/shop' : '/'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          slug={product.slug}
          description={product.description}
          categoryName={product.categoryName}
          image={product.image}
          price={product.price}
          salePrice={product.salePrice}
          stock={product.stock}
        />
      ))}
    </div>
  );
}
