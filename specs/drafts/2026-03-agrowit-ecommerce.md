# AgrowIT E-Commerce Platform

**Author:** AgrowIT Team  
**Status:** Draft  
**Date:** Mar 22, 2026  

---

## Problem statement

AgrowIT needs a fully functional e-commerce platform for selling spices online. Currently there is no digital storefront, which limits reach to local/offline customers only. The platform should allow customers to browse, purchase, and track spice orders online, and give admins full control over products, orders, and discounts.

---

## Proposed solution

Build a React + Firebase web application with Razorpay payment integration. The app will have a customer-facing storefront and a role-protected admin panel, all within a single React SPA (Vite).

---

## Tech stack

| Layer       | Choice                         |
|-------------|--------------------------------|
| Frontend    | React 18 + Vite                |
| Routing     | React Router v6                |
| Styling     | Tailwind CSS                   |
| Auth        | Firebase Authentication        |
| Database    | Firebase Firestore             |
| Storage     | Firebase Storage               |
| Payment     | Razorpay                       |
| Email       | Resend (transactional email)   |
| Icons       | Lucide React                   |
| State       | React Context API              |
| Hosting     | Firebase Hosting / Vercel      |

---

## Data model (Firestore)

### `/users/{uid}`
```
{
  uid: string,
  name: string,
  email: string,
  phone: string,
  role: "customer" | "admin",
  addresses: Address[],
  createdAt: timestamp
}
```

### `/products/{id}`
```
{
  id: string,
  name: string,
  slug: string,
  description: string,
  price: number,
  discountedPrice: number | null,
  category: string,
  images: string[],
  stock: number,
  unit: string, // e.g. "100g", "250g"
  tags: string[],
  avgRating: number,
  reviewCount: number,
  featured: boolean,
  createdAt: timestamp
}
```

### `/orders/{id}`
```
{
  id: string,
  userId: string,
  items: OrderItem[],
  subtotal: number,
  discount: number,
  total: number,
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
  address: Address,
  paymentId: string,
  razorpayOrderId: string,
  discountCode: string | null,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `/reviews/{id}`
```
{
  id: string,
  productId: string,
  userId: string,
  userName: string,
  rating: number, // 1-5
  text: string,
  verified: boolean, // has purchased the product
  createdAt: timestamp
}
```

### `/discounts/{code}`
```
{
  code: string,
  type: "percentage" | "fixed",
  value: number,
  minOrderAmount: number,
  usageLimit: number,
  usedCount: number,
  expiresAt: timestamp,
  active: boolean
}
```

### `/categories/{id}`
```
{
  id: string,
  name: string,
  slug: string,
  image: string,
  description: string
}
```

---

## Page structure

### Customer pages
| Route | Page |
|---|---|
| `/` | Homepage |
| `/products` | Product catalog |
| `/products/:slug` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/order-success/:id` | Order confirmation |
| `/orders` | Order history (protected) |
| `/orders/:id` | Order detail (protected) |
| `/account` | User profile (protected) |
| `/wishlist` | Wishlist (protected) |
| `/login` | Login |
| `/signup` | Signup |

### Admin pages
| Route | Page |
|---|---|
| `/admin` | Dashboard + analytics |
| `/admin/products` | Product management |
| `/admin/products/new` | Add product |
| `/admin/products/:id/edit` | Edit product |
| `/admin/orders` | Order management |
| `/admin/orders/:id` | Order detail |
| `/admin/discounts` | Discount code management |

---

## API / integration points

### Razorpay
- Create order on backend (Firebase Cloud Function or API route)
- Open Razorpay checkout on client
- Verify payment signature on success
- Update order status in Firestore

### Firebase Auth
- Email/password sign up and login
- Google OAuth
- Role-based access control via custom claims or Firestore `role` field

### Resend (email)
- Order confirmation email on successful payment
- Order status update emails (shipped, delivered)

---

## UI design

- **Brand:** AgrowIT
- **Primary color:** Fresh green (#2d6a4f, #40916c)
- **Accent:** Warm amber (#f4a261) for highlights and badges
- **Background:** Off-white (#fafaf9) with earthy undertones
- **Font:** Inter (system-readable, modern)
- **Feel:** Clean, organic, trustworthy — natural food brand

---

## Acceptance criteria

- [ ] Customers can browse and search/filter the product catalog
- [ ] Customers can view product detail pages with images and reviews
- [ ] Customers can add products to cart and wishlist
- [ ] Customers can sign up and log in (email or Google)
- [ ] Customers can apply discount/promo codes at checkout
- [ ] Customers can complete payment via Razorpay
- [ ] Customers receive an order confirmation email after payment
- [ ] Customers can view order history and individual order status
- [ ] Only verified purchasers can leave a product review
- [ ] Admins can log in and access the `/admin` panel
- [ ] Admins can add, edit, and delete products with image upload
- [ ] Admins can view and update order status
- [ ] Admins can create and manage discount codes
- [ ] Admin dashboard shows key analytics (revenue, orders, top products)
- [ ] All auth-protected routes redirect unauthenticated users to login
- [ ] All admin routes reject non-admin users

---

## Out of scope

- Mobile app (iOS/Android)
- Multi-vendor marketplace
- Loyalty/rewards program
- Live chat support
- Shipping carrier API integration (manual status updates only)
- Subscription/recurring orders

---

## Open questions

- Will Razorpay be in test mode initially or go live from day one?
- Is there a logo asset for AgrowIT, or should we create a text-based logo?
- What spice categories should be seeded initially?
- Who is the initial admin user?

---

## Dependencies

- Firebase project must be created and configured
- Razorpay account (test keys for development)
- Resend account for transactional email
- Node.js 18+ installed to run the project
