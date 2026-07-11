# Attyre - Premium Clothing E-Commerce Platform

Attyre is a modern e-commerce application built for small-to-medium clothing businesses. It provides a complete shopping experience with product browsing, cart management, order placement, customer account management, and a comprehensive admin dashboard for business operations.

## Technology Stack

- **Frontend**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB (configured for setup)
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
├── lib/                     # Utilities and constants
│   └── constants.ts         # App constants
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

## Environment Variables

Create a `.env.local` file in the root directory. See `.env.example` for reference:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attyre
SESSION_SECRET=<generated-secret-key>
ADMIN_EMAIL=admin@attyre.com
ADMIN_PASSWORD=SecurePassword123!
NODE_ENV=development
```

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
Configuration and utilities:
- Database connections
- API clients
- Constants
- Helper functions

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

- [ ] Database integration (MongoDB)
- [ ] User authentication and authorization
- [ ] Shopping cart with local/database persistence
- [ ] Payment gateway integration (Stripe, etc.)
- [ ] Admin dashboard with analytics
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Inventory tracking
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

**Last Updated**: July 2024
**Version**: 0.1.0 (Prototype UI and Foundation)
