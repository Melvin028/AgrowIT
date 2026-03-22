# AgrowIT — E-Commerce Spice Shop

A full-featured e-commerce web application for selling spices online, built with React + Firebase + Razorpay.

---

## Tech stack

- **Frontend:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Auth:** Firebase Authentication (email/password + Google)
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage (product images)
- **Payment:** Razorpay
- **Notifications:** react-hot-toast
- **Forms:** react-hook-form

---

## Features

- Product catalog with search, filters, and sorting
- Product detail pages with image gallery and reviews
- Shopping cart (persisted in localStorage)
- Wishlist (synced to Firestore)
- User authentication (email + Google OAuth)
- Multi-step checkout with Razorpay payment
- Discount / promo code support
- Order history and tracking for customers
- Admin panel with dashboard analytics
- Admin product management with image upload
- Admin order management with status updates
- Admin discount code management
- Product reviews (verified purchasers only)

---

## Prerequisites

Before starting, make sure you have:

1. **Node.js 18+** installed — download from https://nodejs.org
2. **A Firebase project** — create one at https://console.firebase.google.com
3. **A Razorpay account** — sign up at https://razorpay.com (use test keys for development)

---

## Setup

### Step 1 — Clone and install dependencies

```bash
cd AgrowIT
npm install
```

### Step 2 — Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use an existing one)
3. Enable the following services:
   - **Authentication** → Sign-in methods → Enable **Email/Password** and **Google**
   - **Firestore Database** → Create in production mode, then set rules (see below)
   - **Storage** → Enable with default rules
4. Go to Project Settings → General → Your apps → Add a **Web app**
5. Copy the config values

### Step 3 — Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Step 4 — Set up Firestore security rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /categories/{catId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /orders/{orderId} {
      allow read, write: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
    }

    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /discounts/{code} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 5 — Set up Storage rules

In Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 6 — Create your first admin user

1. Sign up in the app normally (at `/signup`)
2. Go to Firebase Console → Firestore → `users` collection
3. Find your user document
4. Change the `role` field from `"customer"` to `"admin"`
5. Refresh the app — you'll now see the "Admin panel" link

### Step 7 — Seed initial categories (optional)

In Firebase Console → Firestore, create a `categories` collection with documents like:

```json
{
  "name": "Whole spices",
  "slug": "whole-spices",
  "description": "Pure, unprocessed spices in their natural form",
  "image": ""
}
```

Suggested categories:
- `whole-spices` — Whole spices
- `ground-spices` — Ground spices
- `spice-blends` — Spice blends
- `seeds` — Seeds
- `herbs` — Herbs & leaves

### Step 8 — Start the development server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Razorpay integration notes

- The app uses **Razorpay's client-side checkout** (no server required for test mode)
- For **production**, you should create Razorpay orders server-side and verify payment signatures. This requires a backend (Firebase Cloud Functions or a separate API)
- In test mode, use Razorpay's test card: `4111 1111 1111 1111`, any expiry, any CVV
- UPI test ID: `success@razorpay`

---

## Project structure

```
src/
├── firebase/           Firebase config and service functions
│   ├── config.js       Firebase app initialization
│   ├── auth.js         Authentication functions
│   ├── products.js     Product CRUD
│   ├── orders.js       Order management
│   ├── reviews.js      Product reviews
│   ├── discounts.js    Discount code management
│   └── users.js        User profile and wishlist
├── contexts/           React Context providers
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── WishlistContext.jsx
├── components/
│   ├── common/         Shared components (Header, Footer, routes)
│   ├── product/        Product-specific components
│   └── admin/          Admin layout
├── pages/              Route page components
│   ├── admin/          Admin panel pages
│   └── ...             Customer pages
└── utils/              Utility functions (formatters)
```

---

## Build for production

```bash
npm run build
```

The output will be in the `dist/` folder. Deploy to:
- **Firebase Hosting:** `firebase deploy`
- **Vercel:** connect your GitHub repo
- **Netlify:** drag and drop the `dist/` folder

---

## Environment variables reference

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID (use `rzp_test_` prefix for test mode) |
