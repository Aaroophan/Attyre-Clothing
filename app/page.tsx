import { sampleCategories, sampleProducts } from '@/data/seed';
import { formatPrice } from '@/utils';
import { CURRENCY } from '@/lib/constants';

export default function Home() {
  return (
    <div className="container-max py-8">
      <section className="mb-16">
        <div className="bg-gradient-to-r from-primary to-primary-darker text-white rounded-lg p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to {process.env.NEXT_PUBLIC_SITE_NAME || 'Attyre'}</h2>
          <p className="text-lg mb-8">
            Discover premium clothing for every occasion
          </p>
          <button className="btn-primary bg-white text-primary hover:bg-gray-100">
            Shop Now
          </button>
        </div>
      </section>

      <section className="mb-16">
        <h3 className="text-3xl font-bold mb-8 text-dark">Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCategories.map((category) => (
            <div
              key={category.id}
              className="card p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
            >
              <h4 className="text-xl font-bold text-dark mb-2">
                {category.name}
              </h4>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <a
                href={`/customer/${category.slug}`}
                className="text-primary font-semibold hover:text-primary-darker transition-colors"
              >
                Browse →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-3xl font-bold mb-8 text-dark">Featured Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((product) => (
            <div key={product.id} className="card overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-64 object-cover bg-gray-200"
              />
              <div className="p-4">
                <h4 className="text-lg font-bold text-dark mb-2">
                  {product.name}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price, CURRENCY)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.originalPrice, CURRENCY)}
                      </span>
                    )}
                  </div>
                </div>
                <button className="btn-primary w-full text-center">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
