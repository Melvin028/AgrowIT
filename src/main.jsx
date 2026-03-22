import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { isMisconfigured } from './firebase/config'
import './index.css'

const root = document.getElementById('root')

if (isMisconfigured) {
  root.innerHTML = `
    <div style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fafaf9;padding:24px;">
      <div style="max-width:480px;background:white;border-radius:16px;border:1px solid #e5e7eb;padding:32px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="width:48px;height:48px;background:#fef2f2;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <svg width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px;">Firebase not configured</h2>
        <p style="font-size:14px;color:#6b7280;margin:0 0 16px;line-height:1.6;">
          Add the following environment variables in your <strong>Vercel project → Settings → Environment Variables</strong>, then redeploy.
        </p>
        <pre style="text-align:left;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;font-size:12px;color:#374151;line-height:1.8;overflow:auto;">VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_RAZORPAY_KEY_ID</pre>
      </div>
    </div>
  `
} else {
  Promise.all([
    import('./App'),
    import('./contexts/AuthContext'),
    import('./contexts/CartContext'),
    import('./contexts/WishlistContext'),
  ]).then(([{ default: App }, { AuthProvider }, { CartProvider }, { WishlistProvider }]) => {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
                    success: { iconTheme: { primary: '#40916c', secondary: '#fff' } },
                  }}
                />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>
    )
  })
}
