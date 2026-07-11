# Attyre - Premium Clothing E-Commerce Platform

Attyre is a modern e-commerce application built for small-to-medium clothing businesses. It provides a complete shopping experience with product browsing, cart management, order placement, customer account management, and a comprehensive admin dashboard for business operations.

## Technology Stack

- **Frontend**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with the official native Node.js driver
- **Authentication**: Session-based (to be configured)
- **Linting**: ESLint with Next.js configuration

## Features

### Customer Features
- Browse products by category
- Search and filter products
- View detailed product information
- Add products to cart with size/color selection
- Manage shopping cart
- Checkout with Cash on Delivery (COD) payment
- Order history and tracking
- Customer account management
- Address management

### Admin Features
- Product management (create, read, update, delete)
- Category management
- Inventory management
- Order management and fulfillment
- Basic sales analytics
- Admin dashboard with overview

## Project Structure

```
attyre-clothing/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   ├── admin/               # Admin pages
│   ├── customer/            # Customer pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
├── lib/                     # Utilities, constants, and database access
│   ├── constants.ts         # App constants
│   ├── mongodb.ts           # MongoDB native driver connection
│   └── db/                  # Collection helpers and data access functions
├── types/                   # TypeScript type definitions
├── utils/                   # Helper functions
├── data/                    # Seed data and sample content
├── public/                  # Static assets
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aaroophan/Attyre-Clothing.git
   cd Attyre-Clothing
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then update `.env.local` with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DB`: MongoDB database name, defaults to `attyre`
   - `SESSION_SECRET`: Generate with `openssl rand -base64 32`
   - `ADMIN_EMAIL`: Admin account email
   - `ADMIN_PASSWORD`: Admin account password

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed MongoDB with demo categories, products, and an admin user
- `npm run db:seed` - Alias for `npm run seed`

## Environment Variables

Create a `.env.local` file in the root directory. See `.env.example` for reference:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attyre
MONGODB_DB=attyre
SESSION_SECRET=<generated-secret-key>
ADMIN_EMAIL=admin@attyre.com
ADMIN_PASSWORD=SecurePassword123!
NODE_ENV=development
```



## Seed Data and Demo Catalog

Issue 04 adds an idempotent MongoDB seed script for the initial Attyre catalog. The script creates indexes, upserts demo categories, upserts at least 12 clothing products, and creates/updates the default admin user with a hashed password.

Seed command:

```bash
npm run seed
```

Seeded collections:

```
users        # default admin user
categories   # Men, Women, Accessories, New Arrivals, Sale
products     # 12 realistic clothing/accessory products
orders       # index prepared for future order creation
```

The seed script is safe to re-run. It matches records by stable values such as category slug, product slug, and admin email, then updates those records instead of blindly duplicating data. It also marks seeded records with `seeded: true` and `seedSource: attyre-issue-04-demo-catalog` for evidence and later inspection in MongoDB Atlas.

Default admin credentials are read from environment variables:

```
ADMIN_EMAIL=admin@attyre.com
ADMIN_PASSWORD=SecurePassword123!
```

The password is stored as a bcrypt hash, not as plain text.

## MongoDB Database Layer

Issue 03 adds the MongoDB foundation using the official native MongoDB Node.js driver. No Prisma or Mongoose is used.

Main files:

```
lib/mongodb.ts              # Shared MongoDB client connection helper
lib/db/collections.ts       # Database and collection helpers
lib/db/object-id.ts         # ObjectId conversion and serialization helpers
lib/db/products.ts          # Product data access helpers
lib/db/categories.ts        # Category data access helpers
lib/db/orders.ts            # Order data access helpers
lib/db/users.ts             # User data access helpers
app/api/health/database     # Runtime database connection check
types/database.ts           # MongoDB document interfaces
```

Runtime database check:

```bash
curl http://localhost:3000/api/health/database
```

Expected successful response:

```json
{
  "ok": true,
  "database": "attyre",
  "message": "MongoDB connection successful."
}
```


## Product Listing, Search, Filter, and Sort

Issue 06 expands `/shop` into a functional customer product listing page backed by MongoDB. The page reads URL query parameters and supports:

```
/shop
/shop?category=men
/shop?q=shirt
/shop?sort=price-asc
/shop?category=sale&q=jacket&sort=price-desc
```

Implemented shop features:

- MongoDB-backed active product listing
- category filter pills with product counts
- search by product name/description
- sort by newest, price low to high, price high to low, and name A to Z
- sale price and original price display
- In Stock, Low Stock, and Out of Stock labels
- empty-state handling for no matching products
- fallback to bundled seed data when MongoDB is unavailable

Important files:

```
app/shop/page.tsx                         # Product listing route
components/storefront/ProductCard.tsx     # Reusable product card
components/storefront/ProductGrid.tsx     # Responsive product grid and empty state
components/storefront/ShopControls.tsx    # Search/filter/sort controls
lib/db/products.ts                        # MongoDB product filtering helper
```



## Product Details, Variant Selection, and Stock Awareness

Issue 07 expands `/shop/[slug]` into a full product details page. The page loads the selected product by slug, displays full product information, and provides customer-facing controls for simple clothing variants.

Implemented product details features:

- dynamic product detail pages using `/shop/[slug]`
- MongoDB-backed product lookup with seed-data fallback
- product image, name, description, category, SKU, date added, price, and sale price display
- size selector
- color selector
- stock-aware quantity selector
- disabled Add to Cart button for out-of-stock products
- validation messages when size, color, or quantity is invalid
- related products from the same category
- product-specific metadata for the browser title and description
- responsive two-column desktop layout with stacked mobile layout

Important files:

```
app/shop/[slug]/page.tsx                         # Full product details route
components/storefront/ProductPurchasePanel.tsx   # Client-side size/color/quantity selector
components/storefront/ProductGrid.tsx            # Related product display
lib/db/products.ts                               # Product lookup and related product loading
```

Useful test URLs:

```
/shop/classic-white-shirt
/shop/streetwear-jacket
/shop/pleated-skirt
/shop/not-a-real-product
```

`pleated-skirt` is intentionally seeded with zero stock, so it can be used to test the out-of-stock UI and disabled Add to Cart behavior.

## Development Guidelines

### Path Aliases

Import using path aliases for cleaner code:
- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/types` → `types/`
- `@/utils` → `utils/`
- `@/data` → `data/`

Example:
```tsx
import { formatPrice } from '@/utils';
import type { IProduct } from '@/types';
import { sampleProducts } from '@/data/seed';
```

### Utility Functions

Common utilities are available in `@/utils/index.ts`:
- `cn()` - Merge class names
- `formatPrice()` - Format numbers as currency
- `toSlug()` - Convert strings to URL slugs
- `formatDate()` - Format dates to readable strings
- `safeJsonParse()` - Safely parse JSON
- `safeJsonStringify()` - Safely stringify objects

### Color Palette

Attyre uses a professional blue-based color scheme:
- **Primary**: `#00a7e1` (Bright Blue)
- **Primary Dark**: `#007ea7` (Medium Blue)
- **Primary Darker**: `#003459` (Dark Blue)
- **Dark**: `#00171f` (Almost Black)
- **White**: `#ffffff` (White)

## Folder Organization

### `/app`
Contains Next.js pages and API routes organized by user type:
- `admin/` - Admin management pages
- `customer/` - Customer-facing pages
- `api/` - API endpoints

### `/components`
Reusable UI components:
- Product components
- Cart components
- Order components
- Common UI components (buttons, cards, forms, etc.)

### `/lib`
Configuration, constants, and database utilities:
- MongoDB native driver connection
- Collection name constants
- Product data access helpers
- Category data access helpers
- User data access helpers
- Order data access helpers
- ObjectId conversion and document serialization helpers

### `/types`
Shared TypeScript interfaces:
- Product types
- Order types
- User types
- etc.

### `/utils`
Helper and utility functions:
- String formatting (currency, slugs, dates)
- Class name merging
- JSON safe parsing

### `/data`
Sample data and seed files for development

## Testing

The project includes ESLint for code quality. Run linting with:
```bash
npm run lint
```

## Deployment

Build and start the production server:
```bash
npm run build
npm start
```

The application can be deployed to Vercel, AWS, or any Node.js hosting provider.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Future Enhancements

- [x] Database integration (MongoDB)
- [ ] User authentication and authorization
- [ ] Shopping cart with local/database persistence
- [ ] Payment gateway integration (Stripe, etc.)
- [ ] Admin dashboard with analytics
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [x] Basic product stock labels
- [ ] Order tracking system

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## Project Setup Completed

✅ Next.js project initialized with TypeScript
✅ Tailwind CSS configured with Attyre color palette
✅ Folder structure created
✅ Environment variable structure defined
✅ Path aliases configured
✅ Utility functions implemented
✅ Type definitions created
✅ Sample data and seed files added
✅ README with complete documentation

---

**Last Updated**: July 2026
**Version**: 0.1.0 (Product Listing Prototype)
