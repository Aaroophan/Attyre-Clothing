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
- [x] Shopping cart with localStorage persistence
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
**Version**: 0.1.0 (Cart Prototype)

## Issue 08 - Cart System Using Local Storage

Issue 08 adds the customer shopping cart flow for Attyre.

### Added Cart Features

- Customer can add products to the cart from the product details page.
- Selected size and color are stored with each cart item.
- Same product with the same size/color increases quantity instead of creating a duplicate row.
- Same product with a different size/color is treated as a separate cart item.
- Cart data persists in browser `localStorage` across page refreshes.
- Header cart count updates after cart changes.
- Cart page supports quantity updates.
- Cart page supports item removal.
- Cart page supports clearing the whole cart.
- Cart totals update automatically.
- Quantity updates are limited by product stock.
- Empty cart shows a friendly empty state.
- Checkout button appears only when the cart has items.

### Cart Routes

```text
/cart
/checkout
```

`/checkout` is currently a placeholder page so the cart flow does not lead to a 404. The full Cash on Delivery checkout form and MongoDB order creation will be implemented in Issue 09.

### Cart Storage

The cart is stored in browser local storage under:

```text
attyre-cart-items
```

The cart intentionally uses browser storage instead of database storage at this stage to keep the RAD MVP simple and fast to test.

### Testing Issue 08

```bash
npm install
npm run seed
npm run dev
```

Then test:

```text
http://localhost:3000/shop/classic-white-shirt
http://localhost:3000/cart
```

Manual checks:

- Add one product to cart.
- Refresh the browser and confirm the cart still contains the item.
- Add the same product with the same size/color and confirm quantity increases.
- Add the same product with a different size/color and confirm it creates a separate row.
- Increase and decrease cart quantity.
- Confirm quantity cannot exceed available stock.
- Remove one item.
- Clear the cart.
- Confirm empty cart state appears.

## UI polish correction pass

After reviewing the submitted screenshots, the previous responsive pass was not acceptable: spacing was inconsistent, product cards were too large, the header repeated during full-page captures because it was sticky, and several buttons/cards did not read as a clean storefront.

This correction pass standardizes:

- a max-width page container,
- non-sticky header behavior,
- compact product card image ratios,
- consistent card, button, and section spacing,
- responsive home, shop, product detail, cart, and checkout layouts,
- cleaner footer spacing and corrected category links.

Recommended visual checks:

```text
/
/shop
/shop?category=sale
/shop/classic-white-shirt
/shop/formal-chinos
/cart
/checkout
```

Recommended viewport checks:

```text
390px mobile
768px tablet
1024px laptop
1440px desktop
```

## Issue 09 - Cash on Delivery Checkout and Order Placement

Issue 09 replaces the placeholder checkout page with a real Cash on Delivery order flow.

### Added Checkout Features

- `/checkout` now shows a full delivery details form.
- Checkout collects customer name, email, phone, address, city, district, and optional order note.
- Cash on Delivery is the only available payment method.
- Client-side validation prevents missing customer and delivery details.
- `/api/orders` creates orders in MongoDB.
- Server-side validation rechecks product IDs, quantities, active product status, size/color selections, current prices, and current stock.
- The server ignores cart prices from local storage and calculates order totals from MongoDB products.
- Product stock is reduced only after the order is accepted.
- Order creation and stock reduction run inside a MongoDB transaction.
- Cart is cleared after successful checkout.
- Customers are redirected to `/order-success/[orderNumber]` after order placement.
- The order success page displays order number, customer details, ordered items, totals, payment method, and status.

### Checkout Routes

```text
/checkout
/api/orders
/order-success/[orderNumber]
```

### Testing Issue 09

```bash
npm install
npm run seed
npm run dev
```

Manual test flow:

1. Open `/shop/classic-white-shirt`.
2. Select size, color, and quantity.
3. Add the product to cart.
4. Open `/cart` and continue to checkout.
5. Submit the checkout form with valid delivery details.
6. Confirm the app redirects to `/order-success/[orderNumber]`.
7. Check MongoDB Atlas `orders` collection for the new order document.
8. Check the ordered product in MongoDB Atlas and confirm stock was reduced.
9. Try submitting an empty checkout form and confirm validation messages appear.
10. Try ordering more than available stock and confirm the server rejects the order.

### Important Files

```text
app/checkout/page.tsx                         # Checkout page shell
components/checkout/CheckoutPageClient.tsx    # Client checkout form and submit flow
app/api/orders/route.ts                       # Order creation API route
app/order-success/[orderNumber]/page.tsx      # Order confirmation page
lib/checkout.ts                               # Server-side checkout validation and transaction logic
types/checkout.ts                             # Checkout request and response types
```

The checkout intentionally stays simple for the RAD MVP: no card payments, no payment gateway, no email notifications, and no delivery tracking integration.

## Customer Registration, Login, Sessions, and Order History

Issue 10 adds customer account functionality using custom email/password authentication. It keeps the implementation lightweight for the RAD MVP and avoids external auth providers.

Implemented authentication features:

- customer registration at `/register`
- customer login at `/login`
- logout through the header after login
- HTTP-only cookie session named `attyre_session`
- signed server-side session payload using `SESSION_SECRET`
- password hashing with bcryptjs
- current-user API route at `/api/auth/me`
- protected customer order history at `/account/orders`
- checkout now links orders to the logged-in customer when a session exists
- guest checkout still works when the customer is not logged in

Authentication API routes:

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Customer account routes:

```
/register
/login
/account/orders
```

Testing flow:

```bash
npm run seed
npm run dev
```

Then test:

```
/register              # create a customer account
/login                 # log in with that account
/shop/classic-white-shirt
/cart
/checkout              # place an order while logged in
/account/orders        # confirm the order appears in customer history
```

Security notes for the assignment:

- Passwords are stored as bcrypt hashes, not plain text.
- Session data is stored in an HTTP-only cookie, not localStorage.
- Customer order history is filtered by the logged-in customer ID.
- Admin route protection is implemented in Issue 11 under `/admin`.


## Issue 11 - Admin Authentication, Route Protection, and Admin Layout

Issue 11 adds the protected administration area for the Attyre store owner. It uses the same email/password session system from Issue 10, but restricts `/admin` pages to users with the `admin` role.

Implemented admin features:

- protected `/admin` route group
- server-side admin access check in `app/admin/layout.tsx`
- guest users are redirected to `/login?next=/admin`
- logged-in customer users are blocked with an access denied screen
- seeded admin users can open the admin dashboard
- reusable admin sidebar/top layout
- admin account display and admin logout button
- protected admin placeholder routes for future issues:
  - `/admin/products`
  - `/admin/categories`
  - `/admin/orders`
- admin helper functions in `lib/auth/admin.ts`

Admin routes:

```text
/admin
/admin/products
/admin/categories
/admin/orders
```

Manual testing flow:

```bash
npm run seed
npm run dev
```

Then test:

```text
/admin                         # guest should redirect to /login?next=/admin
/login?next=/admin             # log in as admin
/admin                         # admin dashboard should open
/admin/products                # protected placeholder should open
/admin/categories              # protected placeholder should open
/admin/orders                  # protected placeholder should open
```

Default seeded admin credentials come from environment variables:

```env
ADMIN_EMAIL=admin@attyre.com
ADMIN_PASSWORD=SecurePassword123!
```

For testing customer blocking:

1. Register or log in as a normal customer.
2. Open `/admin`.
3. Confirm the access denied screen appears instead of the admin dashboard.

Important files:

```text
app/admin/layout.tsx                    # Server-side admin guard and protected layout wrapper
app/admin/page.tsx                      # Protected admin dashboard landing page
app/admin/products/page.tsx             # Protected product admin placeholder
app/admin/categories/page.tsx           # Protected category admin placeholder
app/admin/orders/page.tsx               # Protected order admin placeholder
components/admin/AdminShell.tsx         # Admin navigation/sidebar layout
components/admin/AdminLogoutButton.tsx  # Admin logout action
lib/auth/admin.ts                       # Admin role helper functions
```

## Issue 12 - Admin Dashboard and Basic Sales Overview

Issue 12 replaces the protected admin landing placeholder with a real MongoDB-backed dashboard for the Attyre store owner.

Implemented dashboard features:

- active product count
- total order count
- pending order count
- delivered order count
- low-stock product count
- estimated sales total excluding cancelled orders
- estimated average order value for non-cancelled orders
- latest five orders preview
- low-stock product preview
- order status snapshot
- responsive dashboard cards and tables
- read-only admin order preview route for dashboard links

Admin dashboard routes:

```text
/admin                    # dashboard metrics and sales overview
/admin/orders/[id]        # read-only order preview linked from recent orders
/admin/products           # product management placeholder for Issue 13
/admin/categories         # category management placeholder for Issue 14
/admin/orders             # order management placeholder for Issue 15
```

Manual testing flow:

```bash
npm run seed
npm run dev
```

Then test:

```text
/login?next=/admin        # log in as admin
/admin                    # verify dashboard cards and recent order preview
/admin/orders/[id]        # open a recent order from the dashboard
```

To test dashboard order metrics properly:

1. Log in as a customer.
2. Add a product to cart.
3. Place a Cash on Delivery order through `/checkout`.
4. Log out and log in as the admin.
5. Open `/admin`.
6. Confirm total orders, pending orders, sales total, and recent orders are updated.

Default seeded admin credentials come from environment variables:

```env
ADMIN_EMAIL=admin@attyre.com
ADMIN_PASSWORD=SecurePassword123!
```

Important files:

```text
app/admin/page.tsx                    # MongoDB-backed dashboard metrics and recent orders
app/admin/orders/[id]/page.tsx        # Read-only admin order preview
components/admin/DashboardCard.tsx    # Reusable dashboard metric card
components/admin/index.ts             # Admin component exports
lib/db/products.ts                    # Product count and low-stock helpers
lib/db/orders.ts                      # Order counts, sales total, and recent order helpers
```

## Issue 13 - Admin Product Management: Create, Read, Update, and Deactivate Products

Issue 13 turns the protected `/admin/products` placeholder into a working product management area for the Attyre store owner.

Implemented product management features:

- MongoDB-backed admin product listing
- product search by name or description
- product category filter
- active/inactive product status filter
- product create form
- product edit form
- stock update through the edit form
- sale price and regular price management
- category assignment from active MongoDB categories
- product image URL management
- comma-separated size and color variant editing
- featured product toggle
- active product toggle
- soft deactivation/reactivation without deleting order history
- server-side validation for required fields and invalid price/stock values
- duplicate slug protection
- customer shop visibility update after product activation/deactivation

Admin product routes:

```text
/admin/products             # product list, search, filter, status actions
/admin/products/new         # create product
/admin/products/[id]/edit   # edit product, stock, pricing, visibility, variants
```

Admin product API routes:

```text
POST  /api/admin/products        # create product
PUT   /api/admin/products/[id]   # update product
PATCH /api/admin/products/[id]   # deactivate or reactivate product
```

Manual testing flow:

```bash
npm run seed
npm run dev
```

Then test:

```text
/login?next=/admin              # log in as admin
/admin/products                 # verify product table loads
/admin/products/new             # create a new product
/admin/products/[id]/edit       # edit existing product details and stock
/shop                           # confirm active product changes appear in storefront
```

Recommended Issue 13 checks:

1. Create a product with valid data and confirm it appears in `/admin/products`.
2. Open `/shop` and confirm the active created product appears to customers.
3. Edit the product price, stock, sale price, image URL, colors, sizes, and featured setting.
4. Deactivate the product from `/admin/products` and confirm it no longer appears in `/shop`.
5. Reactivate the product and confirm it appears again.
6. Try creating a product with a negative price or stock and confirm validation errors appear.
7. Try reusing an existing slug and confirm duplicate slug validation appears.

Important files:

```text
app/admin/products/page.tsx                  # product list, filters, status actions
app/admin/products/new/page.tsx              # create product page
app/admin/products/[id]/edit/page.tsx        # edit product page
app/api/admin/products/route.ts              # admin create product API
app/api/admin/products/[id]/route.ts         # admin update/status API
components/admin/products/ProductForm.tsx    # reusable create/edit form
components/admin/products/ProductStatusButton.tsx # deactivate/reactivate client action
lib/admin-product-validation.ts              # shared product validation and payload normalization
lib/db/products.ts                           # create/update/list/status database helpers
```
