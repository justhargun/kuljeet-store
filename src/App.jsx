import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, MapPin, ShoppingCart, Home, LayoutGrid, Package, Star, Plus, Minus,
  Check, ChevronRight, ChevronDown, X, Sparkles, Droplet, Droplets,
  Wind, Heart, Palette, Baby, Sun, Tag, Lock, Truck, CreditCard, Banknote,
  MessageCircle, Trash2, PlusCircle, BarChart3, Users,
  ClipboardList, AlertCircle, CheckCircle2, ArrowLeft,
  LogOut, Flower, ShoppingBasket, Smartphone, ImagePlus, KeyRound, Moon, FileText, ShieldCheck, Share2, MoreVertical, Pencil
} from 'lucide-react';

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key, shared) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return null;
        return { key, value: raw, shared: !!shared };
      } catch (e) { throw e; }
    },
    async set(key, value, shared) {
      try {
        window.localStorage.setItem(key, value);
        return { key, value, shared: !!shared };
      } catch (e) { throw e; }
    },
    async delete(key, shared) {
      try {
        window.localStorage.removeItem(key);
        return { key, deleted: true, shared: !!shared };
      } catch (e) { throw e; }
    },
    async list(prefix, shared) {
      try {
        const keys = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (!prefix || (k && k.startsWith(prefix))) keys.push(k);
        }
        return { keys, prefix, shared: !!shared };
      } catch (e) { throw e; }
    }
  };
}

/* ---------------------------------- THEME ---------------------------------- */
const LIGHT_THEME = {
  bg: '#FFE9CC',
  card: '#FFFFFF',
  ink: '#2B2013',
  inkSoft: '#8A7B65',
  border: '#F5D8AC',
  primary: '#D9730D',
  primaryDark: '#B45A05',
  secondary: '#0E6E5C',
  rose: '#B23A5C',
  gold: '#C89116',
  danger: '#C1443A',
  cream: '#FFDDAA',
  purple: '#6B4A9E',
  blue: '#3E7FB0',
  dangerTint: '#FBEAE8',
  successTint: '#EAF5F0',
};
const DARK_THEME = {
  bg: '#18140F',
  card: '#241E17',
  ink: '#F3ECDD',
  inkSoft: '#B0A088',
  border: '#3A3226',
  primary: '#E98A2E',
  primaryDark: '#F0A250',
  secondary: '#2E9C84',
  rose: '#D65C82',
  gold: '#E0AA3D',
  danger: '#E2685D',
  cream: '#2A2419',
  purple: '#9B7BC9',
  blue: '#6FA8D8',
  dangerTint: '#3D2420',
  successTint: '#1D3830',
};
// COLORS is a single mutable object (not reassigned) so every component reading
// COLORS.xxx at render time picks up whichever theme is currently active.
const COLORS = { ...LIGHT_THEME };
function isBannerActive(ds) {
  if (!ds || !ds.bannerEnabled) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (ds.bannerStartDate) {
    const s = new Date(ds.bannerStartDate + 'T00:00:00');
    if (today < s) return false;
  }
  if (ds.bannerEndDate) {
    const e = new Date(ds.bannerEndDate + 'T23:59:59');
    if (today > e) return false;
  }
  return true;
}
function applyTheme(mode, deliverySettings) {
  Object.assign(COLORS, mode === 'dark' ? DARK_THEME : LIGHT_THEME);
  // While a festive banner is live, tint the app's primary accent (buttons,
  // highlights) to match it, so the celebration isn't confined to the banner.
  if (isBannerActive(deliverySettings)) {
    COLORS.primary = deliverySettings.bannerColor1;
    COLORS.primaryDark = deliverySettings.bannerColor2;
  }
}
const displayFont = "'Fraunces', Georgia, serif";
const bodyFont = "'Manrope', system-ui, sans-serif";
const monoFont = "'Space Mono', monospace";

/* -------------------------------- LANGUAGE ---------------------------------- */
// Covers the core shopping flow (nav, search, cart, checkout, product actions) \u2014
// not every screen in the app. Admin panel and legal pages stay in English.
const TRANSLATIONS = {
  en: {
    home: 'Home', categories: 'Categories', wishlist: 'Wishlist', cart: 'Cart', admin: 'Admin',
    search: 'Search products\u2026', setLocation: 'Set location', tagline: 'your neighbourhood, delivered',
    addToCart: 'Add to Cart', buyNow: 'Buy Now', outOfStock: 'Out of Stock', inCart: 'in cart', alreadyInCart: 'already in cart',
    yourCart: 'Your Cart', emptyCart: 'Your cart is empty', proceedToCheckout: 'Proceed to Checkout',
    subtotal: 'Subtotal', deliveryCharge: 'Delivery charge', free: 'FREE', total: 'Total',
    checkout: 'Checkout', fullName: 'Full Name', mobileNumber: 'Mobile Number', deliveryAddress: 'Delivery Address',
    pincode: 'Pincode', placeOrder: 'Place Order', payViaUpi: 'Pay via UPI', writeReview: 'Write a Review',
    addToWishlist: 'Add to Wishlist', maxInStock: 'Max in stock', onlyLeft: 'ONLY {n} LEFT', new: 'NEW', bestseller: 'BESTSELLER',
    storeClosed: 'Store Closed', openingWhatsapp: 'Opening WhatsApp...',
    enterName: 'Please enter your name.', enterMobile: 'Please enter a valid 10-digit mobile number.', enterAddress: 'Please enter your delivery address.',
    deliveringToDoor: 'Delivering to your door', enterPincodeHint: 'Enter your 6-digit pincode so we can confirm we deliver to your area.',
    enterPincodePlaceholder: 'Enter pincode e.g. 201301', weDeliverHere: 'We deliver here', noDeliveryHere: 'Sorry, we currently don\u2019t deliver to this location.',
    confirmLocation: 'Confirm location', skipForNow: 'Skip for now, keep browsing',
    shopByCategory: 'Shop by Category', bestSellers: 'Best Sellers', lovedByNeighbours: 'Loved by your neighbours',
    newArrivals: 'New Arrivals', freshOnShelves: 'Fresh on our shelves', todaysDeals: 'Today\u2019s Deals', grabBeforeGone: 'Grab them before they\u2019re gone',
    recommendedForYou: 'Recommended for You', aboutUsContact: 'About Us & Contact', shopNow: 'Shop Now', noProductsFound: 'No products found.',
    myWishlist: 'My Wishlist', nothingSavedYet: 'Nothing saved yet.', browseProducts: 'Browse Products',
    outOfStockLine: 'Out of stock', onlyLeftOrderSoon: 'Only {n} left \u2014 order soon', inStockCount: '{n} in stock',
    ratingText: 'rating', reviewText: 'review', ratingsAndReviews: 'Ratings & Reviews', noReviewsYet: 'No reviews yet \u2014 be the first to share your experience.',
    yourRating: 'Your rating', yourName: 'Your name', shareExperience: 'Share your experience (optional)', submitReview: 'Submit Review', cancel: 'Cancel',
    faqTitle: 'Frequently Asked Questions', faqIntro: 'Quick answers about shopping with', cantFind: 'Can\u2019t find what you need? Reach us on WhatsApp at',
    aboutContact: 'About Us & Contact', help: 'Help', myDetails: 'My Details', myOrders: 'My Orders', legal: 'Legal',
    saveMyDetails: 'Save My Details', clearMyDetails: 'Clear My Saved Details', fullNameLabel: 'Full Name', mobileNumberLabel: 'Mobile Number',
    deliveryAddressLabel: 'Delivery Address', pincodeLabel: 'Pincode',
  },
  hi: {
    home: '\u0939\u094b\u092e', categories: '\u0936\u094d\u0930\u0947\u0923\u093f\u092f\u093e\u0902', wishlist: '\u0935\u093f\u0936\u0932\u093f\u0938\u094d\u091f', cart: '\u0915\u093e\u0930\u094d\u091f', admin: '\u090f\u0921\u092e\u093f\u0928',
    search: '\u092a\u094d\u0930\u094b\u0921\u0915\u094d\u091f \u0916\u094b\u091c\u0947\u0902\u2026', setLocation: '\u0932\u094b\u0915\u0947\u0936\u0928 \u091a\u0941\u0928\u0947\u0902', tagline: '\u0906\u092a\u0915\u0947 \u092e\u094b\u0939\u0932\u094d\u0932\u0947 \u092e\u0947\u0902, \u0918\u0930 \u092a\u0939\u0941\u0902\u091a\u093e\u092f\u093e \u0917\u092f\u093e',
    addToCart: '\u0915\u093e\u0930\u094d\u091f \u092e\u0947\u0902 \u0921\u093e\u0932\u0947\u0902', buyNow: '\u0905\u092d\u0940 \u0916\u0930\u0940\u0926\u0947\u0902', outOfStock: '\u0938\u094d\u091f\u0949\u0915 \u0916\u0924\u094d\u092e', inCart: '\u0915\u093e\u0930\u094d\u091f \u092e\u0947\u0902', alreadyInCart: '\u092a\u0939\u0932\u0947 \u0938\u0947 \u0915\u093e\u0930\u094d\u091f \u092e\u0947\u0902',
    yourCart: '\u0906\u092a\u0915\u093e \u0915\u093e\u0930\u094d\u091f', emptyCart: '\u0906\u092a\u0915\u093e \u0915\u093e\u0930\u094d\u091f \u0916\u093e\u0932\u0940 \u0939\u0948', proceedToCheckout: '\u091a\u0947\u0915\u0906\u0909\u091f \u0915\u0930\u0947\u0902',
    subtotal: '\u0938\u092c\u091f\u094b\u091f\u0932', deliveryCharge: '\u0921\u093f\u0932\u0940\u0935\u0930\u0940 \u0936\u0941\u0932\u094d\u0915', free: '\u092e\u0941\u092b\u094d\u0924', total: '\u0915\u0941\u0932',
    checkout: '\u091a\u0947\u0915\u0906\u0909\u091f', fullName: '\u092a\u0942\u0930\u093e \u0928\u093e\u092e', mobileNumber: '\u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930', deliveryAddress: '\u0921\u093f\u0932\u0940\u0935\u0930\u0940 \u092a\u0924\u093e',
    pincode: '\u092a\u093f\u0928\u0915\u094b\u0921', placeOrder: '\u0911\u0930\u094d\u0921\u0930 \u0915\u0930\u0947\u0902', payViaUpi: 'UPI \u0938\u0947 \u092d\u0941\u0917\u0924\u093e\u0928 \u0915\u0930\u0947\u0902', writeReview: '\u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0932\u093f\u0916\u0947\u0902',
    addToWishlist: '\u0935\u093f\u0936\u0932\u093f\u0938\u094d\u091f \u092e\u0947\u0902 \u091c\u094b\u0921\u093c\u0947\u0902', maxInStock: '\u0938\u094d\u091f\u0949\u0915 \u092e\u0947\u0902 \u0905\u0927\u093f\u0915\u0924\u092e', onlyLeft: '\u0938\u093f\u0930\u094d\u092b {n} \u092c\u091a\u0947 \u0939\u0948\u0902', new: '\u0928\u092f\u093e', bestseller: '\u092c\u0947\u0938\u094d\u091f\u0938\u0947\u0932\u0930',
    storeClosed: '\u0926\u0941\u0915\u093e\u0928 \u092c\u0902\u0926 \u0939\u0948', openingWhatsapp: '\u0935\u0949\u091f\u094d\u0938\u0910\u092a \u0916\u0941\u0932 \u0930\u0939\u093e \u0939\u0948...',
    enterName: '\u0915\u0943\u092a\u092f\u093e \u0905\u092a\u0928\u093e \u0928\u093e\u092e \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964', enterMobile: '\u0915\u0943\u092a\u092f\u093e \u0938\u0939\u0940 10-\u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964', enterAddress: '\u0915\u0943\u092a\u092f\u093e \u0905\u092a\u0928\u093e \u0921\u093f\u0932\u0940\u0935\u0930\u0940 \u092a\u0924\u093e \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964',
    deliveringToDoor: 'आपके दरवाज़े तक डिलीवरी', enterPincodeHint: 'हम आपके इलाके में डिलीवरी की पुष्टि कर सकें, इसके लिए अपना 6-अंकों का पिनकोड दर्ज करें।',
    enterPincodePlaceholder: 'पिनकोड दर्ज करें जैसे 201301', weDeliverHere: 'हम यहाँ डिलीवरी करते हैं', noDeliveryHere: 'क्षमा करें, हम अभी इस स्थान पर डिलीवरी नहीं करते।',
    confirmLocation: 'लोकेशन कन्फर्म करें', skipForNow: 'अभी छोड़ें, ब्राउज़िंग जारी रखें',
    shopByCategory: 'श्रेणी अनुसार खरीदें', bestSellers: 'बेस्ट सेलर्स', lovedByNeighbours: 'आपके पड़ोसियों की पसंद',
    newArrivals: 'नए उत्पाद', freshOnShelves: 'हमारी अलमारियों में ताज़ा', todaysDeals: 'आज के ऑफर', grabBeforeGone: 'खत्म होने से पहले पाएं',
    recommendedForYou: 'आपके लिए सुझाव', aboutUsContact: 'हमारे बारे में और संपर्क', shopNow: 'अभी खरीदें', noProductsFound: 'कोई उत्पाद नहीं मिला।',
    myWishlist: 'मेरी विशलिस्ट', nothingSavedYet: 'अभी तक कुछ भी सेव नहीं किया गया।', browseProducts: 'उत्पाद देखें',
    outOfStockLine: 'स्टॉक खत्म', onlyLeftOrderSoon: 'केवल {n} बचे \u2014 जल्दी ऑर्डर करें', inStockCount: '{n} स्टॉक में',
    ratingText: 'रेटिंग', reviewText: 'समीक्षा', ratingsAndReviews: 'रेटिंग्स और समीक्षाएं', noReviewsYet: 'अभी तक कोई समीक्षा नहीं \u2014 सबसे पहले अपना अनुभव साझा करें।',
    yourRating: 'आपकी रेटिंग', yourName: 'आपका नाम', shareExperience: 'अपना अनुभव साझा करें (वैकल्पिक)', submitReview: 'समीक्षा सबमिट करें', cancel: 'रद्द करें',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न', faqIntro: 'खरीदारी से जुड़े त्वरित जवाब', cantFind: 'जो चाहिए वो नहीं मिला? हमें व्हाट्सएप पर संपर्क करें',
    aboutContact: 'हमारे बारे में और संपर्क', help: 'सहायता', myDetails: 'मेरी जानकारी', myOrders: 'मेरे ऑर्डर', legal: 'कानूनी',
    saveMyDetails: 'मेरी जानकारी सेव करें', clearMyDetails: 'मेरी सेव की गई जानकारी हटाएं', fullNameLabel: 'पूरा नाम', mobileNumberLabel: 'मोबाइल नंबर',
    deliveryAddressLabel: 'डिलीवरी पता', pincodeLabel: 'पिनकोड',
  },
};
let currentLang = 'en';
function setLang(lang) { currentLang = TRANSLATIONS[lang] ? lang : 'en'; }
function t(key, vars) {
  let str = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS.en[key] || key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
  return str;
}

/* ------------------------------ BACKEND (Supabase) ------------------------------
   Fill these in once you've created a Supabase project and run schema.sql there.
   Project Settings → API → Project URL / anon public key. The anon key is safe
   to ship in client code — it only grants what your Row Level Security policies
   allow (see schema.sql). Until these are filled in, the app automatically keeps
   working exactly as before, using this browser's local storage as a stand-in.
--------------------------------------------------------------------------------- */
const SUPABASE_URL = 'https://lmrplwuoudnpmzspnrdi.supabase.co';       // e.g. 'https://xxxxxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_QP40LFHFW0tPAYOHoIiQyQ_QqLdoP_L';  // e.g. 'eyJhbGciOi...'
const BACKEND_ENABLED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

/* ------------------------------ PAYMENTS (Razorpay) -----------------------------
   Fill in your Razorpay Key ID (Dashboard → Settings → API Keys). This is the
   public "Key ID" only — never put your Key Secret in client-side code; it
   belongs on a server (a Supabase Edge Function, if you set one up later) that
   creates the order and verifies the payment signature. Until this is filled
   in, choosing "Online Payment" at checkout is simply recorded as the chosen
   method, same as before.
--------------------------------------------------------------------------------- */
const RAZORPAY_KEY_ID = ''; // e.g. 'rzp_test_XXXXXXXXXXXXXX' or 'rzp_live_...'
const RAZORPAY_ENABLED = !!RAZORPAY_KEY_ID;

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
function payWithRazorpay({ amountRupees, shopName, customerName, customerMobile }) {
  return new Promise(async (resolve) => {
    const ok = await loadRazorpayScript();
    if (!ok) return resolve({ success: false, error: 'Could not load the payment gateway. Please check your connection and try again.' });
    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: Math.round(amountRupees * 100),
      currency: 'INR',
      name: shopName || 'Online Store',
      description: 'Order payment',
      prefill: { name: customerName, contact: customerMobile },
      theme: { color: '#D9730D' },
      handler: (response) => resolve({ success: true, paymentId: response.razorpay_payment_id }),
      modal: { ondismiss: () => resolve({ success: false, error: 'Payment was cancelled.' }) },
    });
    rzp.on('payment.failed', () => resolve({ success: false, error: 'Payment failed. Please try again or choose Cash on Delivery.' }));
    rzp.open();
  });
}

// currentAuthToken starts as the public anon key (used for all public/customer
// actions). When the shop owner logs in via real Supabase Auth, this becomes
// their personal session token instead, so their writes are treated as
// "authenticated" by the database's security rules. Logging out resets it.
let currentAuthToken = SUPABASE_ANON_KEY;
function setAuthToken(token) { currentAuthToken = token || SUPABASE_ANON_KEY; }

async function sbAuthUpdatePassword(newPassword) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${currentAuthToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Could not update password.');
  return data;
}
async function sbAuthLogin(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Login failed. Check your email and password.');
  return data;
}
async function sbAuthRefresh(refreshToken) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Session expired.');
  return data;
}
async function sbRpc(fnName, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${currentAuthToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Supabase rpc ${fnName} failed (${res.status})`);
  return res.json();
}
async function sbSelect(table, qs = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${currentAuthToken}` },
  });
  if (!res.ok) throw new Error(`Supabase select on ${table} failed (${res.status})`);
  return res.json();
}
async function sbInsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${currentAuthToken}`,
      'Content-Type': 'application/json', Prefer: 'return=representation',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Supabase insert into ${table} failed (${res.status})`);
  return res.json();
}
async function sbUpdate(table, filterQs, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterQs}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${currentAuthToken}`,
      'Content-Type': 'application/json', Prefer: 'return=representation',
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Supabase update on ${table} failed (${res.status})`);
  return res.json();
}
async function sbDelete(table, filterQs) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterQs}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${currentAuthToken}` },
  });
  if (!res.ok) throw new Error(`Supabase delete on ${table} failed (${res.status})`);
}
function buildUpiLink({ upiId, amountRupees, shopName, orderNote }) {
  const params = new URLSearchParams({
    pa: upiId, pn: shopName || 'Store', am: String(amountRupees), cu: 'INR', tn: orderNote || 'Order payment',
  });
  return `upi://pay?${params.toString()}`;
}
function toDbProductPatch(patch) {
  const out = {};
  if ('price' in patch) out.price = patch.price;
  if ('mrp' in patch) out.mrp = patch.mrp;
  if ('stock' in patch) out.stock = patch.stock;
  if ('bestSeller' in patch) out.best_seller = patch.bestSeller;
  if ('isNew' in patch) out.is_new = patch.isNew;
  if ('deal' in patch) out.deal = patch.deal;
  if ('featured' in patch) out.featured = patch.featured;
  if ('name' in patch) out.name = patch.name;
  if ('category' in patch) out.category = patch.category;
  if ('categories' in patch) out.categories = patch.categories;
  if ('emoji' in patch) out.emoji = patch.emoji;
  if ('desc' in patch) out.description = patch.desc;
  if ('imageUrl' in patch) out.image_url = patch.imageUrl;
  if ('quantity' in patch) out.quantity = patch.quantity;
  return out;
}
function mapProductFromDb(r) {
  const categories = Array.isArray(r.categories) && r.categories.length ? r.categories : [r.category];
  return {
    id: r.id, category: r.category, categories, name: r.name, price: Number(r.price), mrp: Number(r.mrp), stock: r.stock,
    emoji: r.emoji || '\ud83d\udecd\ufe0f', g1: r.g1 || '#F7D9C4', g2: r.g2 || '#F0B499', rating: Number(r.rating) || 4,
    bestSeller: !!r.best_seller, isNew: !!r.is_new, deal: !!r.deal, featured: !!r.featured, desc: r.description || '', imageUrl: r.image_url || '', quantity: r.quantity || '',
  };
}
// A product is "in" a category if it's the primary category, or listed among
// its additional categories \u2014 works for both old products (category only)
// and new ones (category + categories[]).
function productInCategory(p, categoryId) {
  return p.category === categoryId || (Array.isArray(p.categories) && p.categories.includes(categoryId));
}
function mapReviewFromDb(r) {
  return { id: r.id, productId: r.product_id, name: r.customer_name, rating: Number(r.rating), comment: r.comment || '', createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now() };
}
function mapSalesLogFromDb(r) {
  return {
    id: r.id, name: r.customer_name || '', mobile: r.customer_mobile || '', address: r.customer_address || '', pincode: r.customer_pincode || '',
    items: Array.isArray(r.items) ? r.items : [], subtotal: Number(r.subtotal) || 0, deliveryCharge: Number(r.delivery_charge) || 0, total: Number(r.total) || 0,
    payment: r.payment || '', paymentRef: r.payment_ref || '', createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  };
}
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function toCSVField(v) {
  const s = String(v == null ? '' : v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function toCSV(headers, rows) {
  return [headers.join(','), ...rows.map((r) => headers.map((h) => toCSVField(r[h])).join(','))].join('\n');
}
function downloadTextFile(filename, text, mime) {
  const blob = new Blob([text], { type: mime || 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function compressDataUrl(srcDataUrl, maxDim = 900, quality = 0.78) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) {
        resolve(srcDataUrl); // fallback to the original if canvas export fails
      }
    };
    img.onerror = () => resolve(srcDataUrl); // fallback if it's not a decodable image
    img.src = srcDataUrl;
  });
}
function readImageAsDataUrl(file) {
  // Phone camera photos are often several MB at 3000px+ wide. Since these
  // get embedded directly in the product list that loads on every visit,
  // an uncompressed photo here means everyone re-downloads megabytes just
  // to see a small thumbnail. This resizes to a sane max width and
  // re-encodes as a compressed JPEG before it ever reaches the database.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      compressDataUrl(reader.result).then(resolve);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function mapDeliveryFromDb(row, pinRows) {
  return {
    shopName: row.shop_name, shopArea: row.shop_area, shopPincode: row.shop_pincode, mode: row.mode, gstNumber: row.gst_number || '', mapsLink: row.maps_link || '',
    radiusKm: Number(row.radius_km), minOrderValue: Number(row.min_order_value), deliveryCharge: Number(row.delivery_charge),
    freeDeliveryThreshold: Number(row.free_delivery_threshold), whatsappNumber: row.whatsapp_number,
    upiId: row.upi_id || '',
    openTime: row.open_time || '09:00',
    closeTime: row.close_time || '21:00',
    manuallyClosed: !!row.manually_closed,
    productsSeeded: !!row.products_seeded,
    adminPassword: row.admin_password || 'admin123',
    bannerEnabled: !!row.banner_enabled,
    bannerTitle: row.banner_title || '',
    bannerSubtitle: row.banner_subtitle || '',
    bannerCta: row.banner_cta || 'Shop Now',
    bannerCategory: row.banner_category || 'offers',
    bannerEmoji: row.banner_emoji || '\ud83c\udf89',
    bannerColor1: row.banner_color1 || '#D9730D',
    bannerColor2: row.banner_color2 || '#B23A5C',
    bannerStartDate: row.banner_start_date || '',
    bannerEndDate: row.banner_end_date || '',
    pincodes: (pinRows || []).map((p) => ({ pincode: p.pincode, area: p.area })),
  };
}

const money = (n) => '\u20b9' + Number(n || 0).toLocaleString('en-IN');
const paymentLabel = (p) => (p === 'cod' ? 'Cash on Delivery' : p === 'upi' ? 'UPI' : 'Online (Card/Netbanking)');
const pctOff = (price, mrp) => (mrp > price ? Math.round((1 - price / mrp) * 100) : 0);
const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const clamp1 = { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

/* ------------------------------- CATEGORIES -------------------------------- */
const CATEGORIES = [
  { id: 'cosmetics', name: 'Cosmetics & Beauty', Icon: Sparkles, color: COLORS.rose },
  { id: 'skincare', name: 'Skincare', Icon: Droplet, color: COLORS.secondary },
  { id: 'haircare', name: 'Hair Care', Icon: Wind, color: COLORS.purple },
  { id: 'personalcare', name: 'Personal Care', Icon: Heart, color: COLORS.primary },
  { id: 'perfumes', name: 'Perfumes & Fragrances', Icon: Flower, color: '#8E5B3F' },
  { id: 'makeup', name: 'Makeup', Icon: Palette, color: '#C13584' },
  { id: 'bath', name: 'Bath & Hygiene', Icon: Droplets, color: COLORS.blue },
  { id: 'baby', name: 'Baby Care', Icon: Baby, color: '#4E9BD9' },
  { id: 'household', name: 'Household Items', Icon: Home, color: '#5C7A3A' },
  { id: 'general', name: 'General Items', Icon: ShoppingBasket, color: '#8A6D3B' },
  { id: 'essentials', name: 'Daily Essentials', Icon: Sun, color: COLORS.gold },
  { id: 'newarrivals', name: 'New Arrivals', Icon: Sparkles, color: COLORS.secondary, virtual: 'isNew' },
  { id: 'offers', name: 'Offers & Discounts', Icon: Tag, color: COLORS.danger, virtual: 'deal' },
];
const REAL_CATEGORIES = CATEGORIES.filter((c) => !c.virtual);
function EmojiIconFactory(emoji) {
  return function EmojiIcon({ size, color }) {
    return <span style={{ fontSize: size, lineHeight: 1 }}>{emoji}</span>;
  };
}

const GRADIENTS = [
  ['#F7D9C4', '#F0B499'], ['#CDEFE3', '#9CD9C3'], ['#E4D6F5', '#C9AEEB'],
  ['#FBE3B0', '#F3C066'], ['#D9EAF7', '#A9CFEA'], ['#F6D3DE', '#E9A6BC'],
  ['#E3EAD1', '#C3D69E'], ['#F0E0CE', '#DDBB8D'],
];
const grad = (i) => GRADIENTS[i % GRADIENTS.length];
/* ---------------------------------- DELIVERY -------------------------------- */
const SEED_DELIVERY = {
  shopName: 'Kuljeet Store',
  shopArea: 'Kuljeet Store, Ganj\nHargaon (Sitapur)\nU.P. 261121',
  shopPincode: '261121',
  gstNumber: '',
  mapsLink: '',
  mode: 'radius',
  pincodes: [
    { pincode: '201301', area: 'Sector 62, Noida' },
    { pincode: '201304', area: 'Sector 78, Noida' },
    { pincode: '201305', area: 'Sector 137, Noida' },
    { pincode: '110096', area: 'Mayur Vihar, Delhi' },
    { pincode: '261121', area: 'Hargaon, Sitapur' },
  ],
  radiusKm: 5,
  minOrderValue: 149,
  deliveryCharge: 29,
  freeDeliveryThreshold: 499,
  whatsappNumber: '918433355769',
  upiId: '8433355769@nyes',
  openTime: '09:00',
  closeTime: '21:00',
  manuallyClosed: false,
  productsSeeded: false,
  bannerEnabled: false,
  bannerTitle: '',
  bannerSubtitle: '',
  bannerCta: 'Shop Now',
  bannerCategory: 'offers',
  bannerEmoji: '\ud83c\udf89',
  bannerColor1: '#D9730D',
  bannerColor2: '#B23A5C',
  bannerStartDate: '',
  bannerEndDate: '',
};
// Demo-only distance lookup, used when the shop chooses radius-based delivery.
// In production this would call a maps/geocoding API instead of a fixed table.
const DISTANCE_TABLE = {
  '201301': 0, '201304': 4, '201305': 9, '110096': 13, '201310': 6, '110044': 16, '201009': 3,
  '261121': 0, '261001': 7, '261141': 9, '261401': 14, '261201': 6,
};

function checkDeliveryZone(pinRaw, settings) {
  const pin = String(pinRaw || '').trim();
  if (!/^\d{6}$/.test(pin)) return { allowed: false, reason: 'invalid' };
  if (settings.mode === 'pincode') {
    const match = settings.pincodes.find((p) => p.pincode === pin);
    return match ? { allowed: true, area: match.area } : { allowed: false, reason: 'outside' };
  }
  const dist = DISTANCE_TABLE[pin];
  if (dist === undefined) return { allowed: false, reason: 'unknown' };
  return dist <= settings.radiusKm ? { allowed: true, distance: dist } : { allowed: false, reason: 'outside', distance: dist };
}

function formatTime12(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
function isShopOpen(settings) {
  if (settings.manuallyClosed) return false;
  if (!settings.openTime || !settings.closeTime) return true;
  const [oh, om] = settings.openTime.split(':').map(Number);
  const [ch, cm] = settings.closeTime.split(':').map(Number);
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  if (closeMins > openMins) return nowMins >= openMins && nowMins < closeMins;
  return nowMins >= openMins || nowMins < closeMins; // handles overnight hours, e.g. 18:00-02:00
}

const LOW_STOCK_THRESHOLD = 5;

/* -------------------------------- SMALL PARTS -------------------------------- */
function PriceTag({ price, mrp, size = 'md' }) {
  const off = pctOff(price, mrp);
  const big = size === 'lg';
  return (
    <div
      className="inline-flex flex-col items-start rounded"
      style={{ background: '#FFFFFF', color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, padding: big ? '8px 12px' : '5px 9px', transform: 'rotate(-2deg)' }}
    >
      <span style={{ fontWeight: 700, fontSize: big ? 22 : 15, lineHeight: 1, color: COLORS.ink }}>{money(price)}</span>
      {off > 0 && (
        <span style={{ fontSize: big ? 12 : 10, color: COLORS.inkSoft, marginTop: 3 }}>
          MRP {money(mrp)} &middot; {off}% off
        </span>
      )}
    </div>
  );
}

function Badge({ children, bg, color = '#fff' }) {
  return (
    <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: bg, color, fontSize: 10, fontFamily: bodyFont }}>
      {children}
    </span>
  );
}

function FestiveSparkles({ count = 9 }) {
  const sparkles = useMemo(() => Array.from({ length: count }, () => ({
    left: Math.random() * 92 + 2,
    top: Math.random() * 80 + 4,
    delay: Math.random() * 2.5,
    duration: 1.8 + Math.random() * 1.8,
    size: 10 + Math.random() * 12,
  })), [count]);
  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 0 }}>
      <style>{`
        @keyframes festiveTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.35) rotate(-8deg); }
          50% { opacity: 1; transform: scale(1) rotate(10deg); }
        }
      `}</style>
      {sparkles.map((s, i) => (
        <span key={i} style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, animation: `festiveTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite` }}>
          {i % 3 === 0 ? '\u2728' : i % 3 === 1 ? '\u2b50' : '\u2726'}
        </span>
      ))}
    </div>
  );
}

function ProductCard({ product, onOpen, onAdd, qty, isWishlisted, onToggleWishlist, size = 'normal' }) {
  const off = pctOff(product.price, product.mrp);
  const big = size === 'large';
  const cardW = big ? 290 : 158;
  const imgH = big ? 230 : 110;
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, minWidth: cardW, width: cardW }}
      onClick={() => onOpen(product)}
    >
      <div className="relative flex items-center justify-center" style={{ height: imgH, background: product.imageUrl ? '#fff' : `linear-gradient(135deg, ${product.g1}, ${product.g2})` }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full" style={{ objectFit: 'cover' }} loading="lazy" decoding="async" />
        ) : (
          <span style={{ fontSize: big ? 72 : 38 }}>{product.emoji}</span>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {product.isNew && <Badge bg={COLORS.secondary}>{t('new')}</Badge>}
          {product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD && <Badge bg={COLORS.gold} color={COLORS.ink}>ONLY {product.stock} LEFT</Badge>}
          {off > 0 && <Badge bg={COLORS.danger}>{off}% OFF</Badge>}
        </div>
        {onToggleWishlist && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
            className="absolute top-2 right-2 flex items-center justify-center rounded-full"
            style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.85)' }}
          >
            <Heart size={14} fill={isWishlisted ? COLORS.danger : 'none'} color={isWishlisted ? COLORS.danger : COLORS.inkSoft} />
          </button>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(43,32,19,0.55)' }}>
            <span className="text-xs font-semibold text-white">Out of stock</span>
          </div>
        )}
      </div>
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <p style={{ ...clamp2, color: COLORS.ink, fontFamily: bodyFont, fontWeight: 600, fontSize: big ? 17 : 12.5, minHeight: big ? 44 : 32 }}>{product.name}</p>
        {product.quantity && <span style={{ fontSize: 10.5, color: COLORS.inkSoft, fontFamily: bodyFont }}>{product.quantity}</span>}
        <div className="flex items-center gap-1">
          <Star size={11} fill={COLORS.gold} color={COLORS.gold} />
          <span style={{ fontSize: 11, color: COLORS.inkSoft, fontFamily: bodyFont }}>{product.rating}</span>
        </div>
        <div className="flex items-end justify-between mt-1">
          <PriceTag price={product.price} mrp={product.mrp} />
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            disabled={product.stock === 0}
            className="rounded-full flex items-center justify-center"
            style={{ width: big ? 46 : 30, height: big ? 46 : 30, background: product.stock === 0 ? COLORS.border : COLORS.primary, color: '#fff', flexShrink: 0 }}
          >
            <Plus size={big ? 23 : 15} />
          </button>
        </div>
        {qty > 0 && <span className="text-center" style={{ fontSize: 10.5, color: COLORS.secondary, fontFamily: bodyFont, fontWeight: 700 }}>{qty} in cart</span>}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, onSeeAll }) {
  return (
    <div className="flex items-end justify-between px-4 mb-2.5">
      <div>
        <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 19, color: COLORS.ink }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft }}>{subtitle}</p>}
      </div>
      {onSeeAll && (
        <button onClick={onSeeAll} className="flex items-center gap-0.5" style={{ color: COLORS.primaryDark, fontFamily: bodyFont, fontSize: 12, fontWeight: 700 }}>
          See all <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

function CategorySlider({ categories, products, nav }) {
  const realCats = categories.filter((c) => !c.virtual);
  return (
    <div
      className="flex gap-4 overflow-x-auto px-4 pb-2"
      style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory', scrollPadding: '0 16px' }}
    >
      <style>{`
        .cat-slide-card { transition: transform 0.15s ease, box-shadow 0.15s ease; scroll-snap-align: center; }
        .cat-slide-card:active { transform: scale(0.96); }
      `}</style>
      {realCats.map((c) => {
        const preview = products.filter((p) => productInCategory(p, c.id)).slice(0, 3);
        const count = products.filter((p) => productInCategory(p, c.id)).length;
        return (
          <div
            key={c.id}
            onClick={() => nav('category', { id: c.id })}
            className="cat-slide-card rounded-3xl overflow-hidden flex-shrink-0 cursor-pointer flex flex-col"
            style={{ width: 230, minHeight: 260, background: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-3 p-4" style={{ background: `${c.color}1A` }}>
              <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 48, height: 48, background: c.color }}>
                <c.Icon size={24} color="#fff" />
              </div>
              <div className="min-w-0">
                <p style={{ ...clamp1, fontFamily: bodyFont, fontWeight: 700, fontSize: 15, color: COLORS.ink }}>{c.name}</p>
                <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, marginTop: 2 }}>{count} product{count === 1 ? '' : 's'}</p>
              </div>
            </div>
            <div className="flex-1 flex gap-2 p-3">
              {preview.length ? preview.map((p) => (
                <div key={p.id} className="flex-1 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: p.imageUrl ? '#fff' : `linear-gradient(135deg, ${p.g1}, ${p.g2})`, border: `1px solid ${COLORS.border}`, minHeight: 90 }}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full" style={{ objectFit: 'cover' }} loading="lazy" decoding="async" /> : <span style={{ fontSize: 30 }}>{p.emoji}</span>}
                </div>
              )) : (
                <div className="flex-1 flex items-center justify-center" style={{ minHeight: 90 }}>
                  <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>No products yet</p>
                </div>
              )}
            </div>
            <div className="px-4 pb-4">
              <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12, color: c.color }}>Browse {c.name} &rarr;</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Rail({ products, onOpen, onAdd, cart, wishlist, onToggleWishlist, size = 'normal' }) {
  if (!products.length) return <p className="px-4 text-sm" style={{ color: COLORS.inkSoft, fontFamily: bodyFont }}>Nothing here yet.</p>;
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={onOpen} onAdd={onAdd} qty={cart[p.id] || 0} isWishlisted={!!(wishlist && wishlist[p.id])} onToggleWishlist={onToggleWishlist} size={size} />
      ))}
    </div>
  );
}

/* --------------------------------- HEADER / NAV --------------------------------- */
function Header({ query = '', setQuery, onSearch, area, onChangeLocation, onBack, title, shopName, products = [], nav, categories = [], deliverySettings, theme, setTheme, lang, setLang: setLangProp }) {
  const [focused, setFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const shopOpen = deliverySettings ? isShopOpen(deliverySettings) : true;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], categories: [] };
    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5);
    const matchedCategories = categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3);
    return { products: matchedProducts, categories: matchedCategories };
  }, [query, products]);

  const hasSuggestions = focused && query.trim() && (suggestions.products.length > 0 || suggestions.categories.length > 0);

  if (title) {
    return (
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3" style={{ background: theme === 'dark' ? COLORS.bg : '#FFF3B0', borderBottom: `1px solid ${COLORS.border}` }}>
        <button onClick={onBack}><ArrowLeft size={20} color={COLORS.ink} /></button>
        <h1 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 17, color: COLORS.ink }}>{title}</h1>
      </div>
    );
  }
  return (
    <div className="sticky top-0 z-20" style={{ background: theme === 'dark' ? COLORS.bg : '#FFF3B0', borderBottom: `1px solid ${COLORS.border}` }}>
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: '#FFC93C' }}>
            <span style={{ fontSize: 24 }}>&#127978;</span>
          </div>
          <div>
            <h1 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 18, color: COLORS.ink, lineHeight: 1 }}>{shopName}</h1>
            <p style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft }}>{t('tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)} className="flex items-center justify-center rounded-full" style={{ width: 30, height: 30, background: COLORS.cream, border: `1px solid ${COLORS.border}` }}>
            <MoreVertical size={15} color={COLORS.ink} />
          </button>
          {showMenu && (
            <>
              <div onClick={() => setShowMenu(false)} className="fixed inset-0" style={{ zIndex: 29 }} />
              <div className="absolute right-0 rounded-xl overflow-hidden flex flex-col" style={{ top: 36, minWidth: 180, background: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 10px 24px rgba(43,32,19,0.12)', zIndex: 30 }}>
                {setLangProp && (
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600, color: COLORS.ink }}>Language</span>
                    <div className="flex rounded-full overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                      <button onClick={() => setLangProp('en')} className="px-2.5 py-1" style={{ background: lang === 'en' ? COLORS.primary : 'transparent', color: lang === 'en' ? '#fff' : COLORS.inkSoft, fontFamily: bodyFont, fontSize: 11, fontWeight: 700 }}>EN</button>
                      <button onClick={() => setLangProp('hi')} className="px-2.5 py-1" style={{ background: lang === 'hi' ? COLORS.primary : 'transparent', color: lang === 'hi' ? '#fff' : COLORS.inkSoft, fontFamily: bodyFont, fontSize: 11, fontWeight: 700 }}>{'\u0939\u093f\u0902'}</button>
                    </div>
                  </div>
                )}
                {[
                  { label: t('myDetails'), page: 'profile' },
                  { label: t('myOrders'), page: 'my-orders' },
                  { label: '\ud83c\udfae Play a Game', page: 'game' },
                  { label: t('aboutUsContact'), page: 'about' },
                  { label: t('faqTitle'), page: 'faq' },
                  { label: 'Terms & Conditions', page: 'terms' },
                  { label: 'Privacy Policy', page: 'privacy' },
                ].map((item) => (
                  <button key={item.page} onClick={() => { setShowMenu(false); nav(item.page); }} className="text-left px-4 py-2.5" style={{ borderBottom: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600, color: COLORS.ink }}>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {setTheme && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center justify-center rounded-full" style={{ width: 30, height: 30, background: COLORS.cream, border: `1px solid ${COLORS.border}` }}>
              {theme === 'dark' ? <Sun size={14} color={COLORS.gold} /> : <Moon size={14} color={COLORS.secondary} />}
            </button>
          )}
          <button onClick={onChangeLocation} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ background: COLORS.cream, border: `1px solid ${COLORS.border}` }}>
            <MapPin size={13} color={COLORS.secondary} />
            <span style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 700, color: COLORS.ink, maxWidth: 78, ...clamp1 }}>{area || t('setLocation')}</span>
            <ChevronDown size={12} color={COLORS.inkSoft} />
          </button>
        </div>
      </div>
      {deliverySettings && (
        <div className="px-4 pt-2 flex items-center gap-1.5">
          <div className="rounded-full" style={{ width: 6, height: 6, background: shopOpen ? COLORS.secondary : COLORS.danger }} />
          <span style={{ fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700, color: shopOpen ? COLORS.secondary : COLORS.danger }}>
            {shopOpen ? `Open now \u00b7 Closes at ${formatTime12(deliverySettings.closeTime)}` : `Closed \u00b7 Opens at ${formatTime12(deliverySettings.openTime)}`}
          </span>
        </div>
      )}
      <div className="px-4 py-3 relative">
        <form onSubmit={(e) => { e.preventDefault(); setFocused(false); onSearch(); }}>
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{
              background: COLORS.card, border: `1.5px solid ${focused ? COLORS.primary : COLORS.border}`,
              borderRadius: hasSuggestions ? '14px 14px 0 0' : 14,
              boxShadow: focused ? '0 4px 14px rgba(217,115,13,0.12)' : 'none',
              transition: 'border-color 120ms ease, box-shadow 120ms ease',
            }}
          >
            <Search size={16} color={focused ? COLORS.primary : COLORS.inkSoft} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder={t("search")}
              style={{ fontFamily: bodyFont, fontSize: 13.5, color: COLORS.ink, background: 'transparent', outline: 'none', width: '100%' }}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="flex-shrink-0">
                <X size={15} color={COLORS.inkSoft} />
              </button>
            )}
          </div>
        </form>

        {hasSuggestions && (
          <div
            className="absolute left-4 right-4 overflow-hidden z-30"
            style={{ top: '100%', marginTop: -1, background: COLORS.card, border: `1.5px solid ${COLORS.primary}`, borderTop: 'none', borderRadius: '0 0 14px 14px', boxShadow: '0 10px 24px rgba(43,32,19,0.12)' }}
          >
            {suggestions.categories.length > 0 && (
              <div className="px-3 pt-2.5 pb-1 flex gap-1.5 flex-wrap">
                {suggestions.categories.map((c) => (
                  <button
                    key={c.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setQuery(''); nav('category', { id: c.id }); }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: `${c.color}14`, border: `1px solid ${c.color}40` }}
                  >
                    <c.Icon size={11} color={c.color} />
                    <span style={{ fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700, color: c.color }}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
            {suggestions.products.map((p) => (
              <button
                key={p.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setQuery(''); nav('product', { id: p.id }); }}
                className="w-full flex items-center gap-3 px-3 py-2"
                style={{ borderTop: `1px solid ${COLORS.border}` }}
              >
                <div className="rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 34, height: 34, background: p.imageUrl ? '#fff' : `linear-gradient(135deg, ${p.g1}, ${p.g2})` }}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full" style={{ objectFit: 'cover' }} loading="lazy" decoding="async" /> : <span style={{ fontSize: 15 }}>{p.emoji}</span>}
                </div>
                <span style={{ ...clamp1, flex: 1, textAlign: 'left', fontFamily: bodyFont, fontSize: 12.5, color: COLORS.ink }}>{p.name}</span>
                <span style={{ fontFamily: monoFont, fontSize: 12, fontWeight: 700, color: COLORS.primaryDark, flexShrink: 0 }}>{money(p.price)}</span>
              </button>
            ))}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setFocused(false); onSearch(); }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5"
              style={{ borderTop: `1px solid ${COLORS.border}`, background: COLORS.cream }}
            >
              <Search size={12} color={COLORS.primaryDark} />
              <span style={{ fontFamily: bodyFont, fontSize: 11.5, fontWeight: 700, color: COLORS.primaryDark }}>See all results for &ldquo;{query}&rdquo;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BottomNav({ page, nav, cartCount }) {
  const items = [
    { id: 'home', label: t('home'), Icon: Home },
    { id: 'categories', label: t('categories'), Icon: LayoutGrid },
    { id: 'wishlist', label: t('wishlist'), Icon: Heart },
    { id: 'cart', label: t('cart'), Icon: ShoppingCart, badge: cartCount },
    { id: 'admin', label: t('admin'), Icon: Lock },
  ];
  return (
    <div className="sticky bottom-0 z-30 flex items-stretch" style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}` }}>
      {items.map((it) => {
        const active = page === it.id || (it.id === 'admin' && page.startsWith('admin'));
        return (
          <button key={it.id} onClick={() => nav(it.id)} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative">
            <div className="relative">
              <it.Icon size={19} color={active ? COLORS.primary : COLORS.inkSoft} strokeWidth={active ? 2.4 : 2} />
              {!!it.badge && (
                <span className="absolute rounded-full flex items-center justify-center" style={{ top: -6, right: -8, minWidth: 15, height: 15, background: COLORS.danger, color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: bodyFont, padding: '0 3px' }}>
                  {it.badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, fontFamily: bodyFont, fontWeight: active ? 700 : 500, color: active ? COLORS.primary : COLORS.inkSoft }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LocationModal({ onClose, onConfirm, deliverySettings }) {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (pin.length === 6) setResult(checkDeliveryZone(pin, deliverySettings));
    else setResult(null);
  }, [pin]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(43,32,19,0.45)' }}>
      <div className="w-full rounded-t-3xl p-5" style={{ background: COLORS.card, maxWidth: 448 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 18, color: COLORS.ink }}>{t('deliveringToDoor')}</h2>
          <button onClick={onClose}><X size={20} color={COLORS.inkSoft} /></button>
        </div>
        <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 14 }}>{t('enterPincodeHint')}</p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder={t('enterPincodePlaceholder')}
          className="w-full px-4 py-3 rounded-xl mb-3"
          style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 15, outline: 'none' }}
        />
        {result && result.allowed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3" style={{ background: COLORS.successTint }}>
            <CheckCircle2 size={16} color={COLORS.secondary} />
            <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.secondary, fontWeight: 700 }}>{t('weDeliverHere')}{result.area ? ' \u2014 ' + result.area : ''}!</span>
          </div>
        )}
        {result && !result.allowed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3" style={{ background: COLORS.dangerTint }}>
            <AlertCircle size={16} color={COLORS.danger} />
            <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.danger, fontWeight: 700 }}>{t('noDeliveryHere')}</span>
          </div>
        )}
        <button
          onClick={() => onConfirm(pin, result)}
          disabled={!result || !result.allowed}
          className="w-full py-3.5 rounded-xl"
          style={{ background: result && result.allowed ? COLORS.primary : COLORS.border, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14 }}
        >
          {t('confirmLocation')}
        </button>
        <button onClick={onClose} className="w-full py-3 text-center" style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft }}>{t('skipForNow')}</button>
      </div>
    </div>
  );
}

/* ----------------------------------- PAGES ----------------------------------- */
function HomePage({ products, nav, onAdd, cart, area, categories, deliverySettings, wishlist, onToggleWishlist }) {
  const bestSellers = products.filter((p) => p.bestSeller);
  const newArrivals = products.filter((p) => p.isNew);
  const deals = products.filter((p) => p.deal);
  const recommended = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
  return (
    <div className="pb-6">
      {isBannerActive(deliverySettings) && (
        <div className="mx-4 mt-1 mb-5 rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${deliverySettings.bannerColor1}, ${deliverySettings.bannerColor2})` }}>
          <FestiveSparkles />
          <div className="relative" style={{ zIndex: 1 }}>
            {deliverySettings.bannerTitle && (
              <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontStyle: 'italic', fontSize: 24, color: '#fff', lineHeight: 1.15 }}>{deliverySettings.bannerTitle}</h2>
            )}
            {deliverySettings.bannerSubtitle && (
              <p style={{ fontFamily: bodyFont, fontSize: 13, color: '#fff', opacity: 0.92, marginTop: 4 }}>{deliverySettings.bannerSubtitle}</p>
            )}
            <button onClick={() => nav('category', { id: deliverySettings.bannerCategory })} className="mt-4 px-4 py-2 rounded-full" style={{ background: COLORS.card, color: COLORS.primaryDark, fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>
              {deliverySettings.bannerCta || t('shopNow')}
            </button>
          </div>
          <span className="absolute" style={{ right: -10, bottom: -20, fontSize: 90, opacity: 0.25 }}>{deliverySettings.bannerEmoji}</span>
        </div>
      )}

      <SectionHeader title={t('shopByCategory')} />
      <div className="flex gap-4 px-4 mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map((c) => (
          <button key={c.id} onClick={() => nav('category', { id: c.id })} className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ width: 64 }}>
            <div className="rounded-2xl flex items-center justify-center" style={{ width: 56, height: 56, background: `${c.color}1A` }}>
              <c.Icon size={22} color={c.color} />
            </div>
            <span style={{ ...clamp2, textAlign: 'center', fontFamily: bodyFont, fontSize: 10, fontWeight: 600, color: COLORS.ink, lineHeight: 1.2 }}>{c.name}</span>
          </button>
        ))}
      </div>

      {products.some((p) => p.featured) && (
        <>
          <SectionHeader title="Featured Products" subtitle="Handpicked picks worth a closer look" />
          <Rail products={products.filter((p) => p.featured)} onOpen={(p) => nav('product', { id: p.id })} onAdd={onAdd} cart={cart} wishlist={wishlist} onToggleWishlist={onToggleWishlist} size="large" />
        </>
      )}
      <div className="mt-6" />
      <SectionHeader title={t('bestSellers')} subtitle={t('lovedByNeighbours')} onSeeAll={() => nav('list', { title: t('bestSellers'), filter: 'bestSeller' })} />
      <Rail products={bestSellers} onOpen={(p) => nav('product', { id: p.id })} onAdd={onAdd} cart={cart} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />

      <div className="mt-6" />
      <SectionHeader title={t('newArrivals')} subtitle={t('freshOnShelves')} onSeeAll={() => nav('category', { id: 'newarrivals' })} />
      <Rail products={newArrivals} onOpen={(p) => nav('product', { id: p.id })} onAdd={onAdd} cart={cart} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />

      <div className="mt-6" />
      <SectionHeader title={t('todaysDeals')} subtitle={t('grabBeforeGone')} onSeeAll={() => nav('category', { id: 'offers' })} />
      <Rail products={deals} onOpen={(p) => nav('product', { id: p.id })} onAdd={onAdd} cart={cart} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />

      <div className="mt-6" />
      <SectionHeader title={t('recommendedForYou')} />
      <div className="grid grid-cols-2 gap-3 px-4">
        {recommended.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={(pr) => nav('product', { id: pr.id })} onAdd={onAdd} qty={cart[p.id] || 0} isWishlisted={!!(wishlist && wishlist[p.id])} onToggleWishlist={onToggleWishlist} />
        ))}
      </div>

      <button onClick={() => nav('about')} className="w-full mt-7 py-3.5 flex items-center justify-center gap-1.5" style={{ borderTop: `1px solid ${COLORS.border}`, color: COLORS.inkSoft, fontFamily: bodyFont, fontSize: 12, fontWeight: 600 }}>
        {t('aboutUsContact')} <ChevronRight size={14} />
      </button>
    </div>
  );
}

function CategoriesPage({ nav, categories }) {
  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      {categories.map((c) => (
        <button key={c.id} onClick={() => nav('category', { id: c.id })} className="rounded-2xl p-4 flex flex-col items-start gap-3" style={{ background: `${c.color}14`, border: `1px solid ${c.color}33` }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: c.color }}>
            <c.Icon size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink, textAlign: 'left' }}>{c.name}</span>
        </button>
      ))}
    </div>
  );
}

function ProductListPage({ products, title, nav, onAdd, cart, wishlist, onToggleWishlist }) {
  return (
    <div className="p-4">
      {!products.length ? (
        <div className="flex flex-col items-center py-16 gap-2">
          <Package size={36} color={COLORS.inkSoft} />
          <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 13 }}>{t('noProductsFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={(pr) => nav('product', { id: pr.id })} onAdd={onAdd} qty={cart[p.id] || 0} isWishlisted={!!(wishlist && wishlist[p.id])} onToggleWishlist={onToggleWishlist} />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistPage({ products, wishlist, nav, onAdd, cart, onToggleWishlist }) {
  const saved = products.filter((p) => wishlist && wishlist[p.id]);
  return (
    <div className="p-4">
      <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 18, color: COLORS.ink, marginBottom: 14 }}>{t('myWishlist')}</h2>
      {!saved.length ? (
        <div className="flex flex-col items-center py-16 gap-2">
          <Heart size={36} color={COLORS.inkSoft} />
          <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 13 }}>{t('nothingSavedYet')}</p>
          <button onClick={() => nav('home')} className="mt-2 px-4 py-2 rounded-full" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>{t('browseProducts')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={(pr) => nav('product', { id: pr.id })} onAdd={onAdd} qty={cart[p.id] || 0} isWishlisted={true} onToggleWishlist={onToggleWishlist} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductPage({ product, nav, onAdd, onBuyNow, qty, reviews = [], onAddReview, isWishlisted, onToggleWishlist }) {
  const [n, setN] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [rName, setRName] = useState('');
  const [rRating, setRRating] = useState(5);
  const [rComment, setRComment] = useState('');
  const [rError, setRError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  if (!product) return null;
  const off = pctOff(product.price, product.mrp);

  const productReviews = reviews.filter((r) => r.productId === product.id).sort((a, b) => b.createdAt - a.createdAt);
  const avgRating = productReviews.length ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) : product.rating;
  const displayRating = Math.round(avgRating * 10) / 10;

  const submitReview = async () => {
    setRError('');
    if (!rName.trim()) return setRError('Please enter your name.');
    if (!rComment.trim()) return setRError('Please write a short review.');
    setSubmitting(true);
    try {
      await onAddReview(product.id, { name: rName.trim(), rating: rRating, comment: rComment.trim() });
      setRName(''); setRRating(5); setRComment(''); setShowForm(false);
    } catch (e) {
      setRError('Could not submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-32">
      <div className="relative flex items-center justify-center" style={{ height: 240, background: product.imageUrl ? '#fff' : `linear-gradient(135deg, ${product.g1}, ${product.g2})` }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full" style={{ objectFit: 'cover', cursor: 'zoom-in' }} onClick={() => setShowFullImage(true)} />
        ) : (
          <span style={{ fontSize: 96 }}>{product.emoji}</span>
        )}
        {onToggleWishlist && (
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="absolute top-3 right-3 flex items-center justify-center rounded-full"
            style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.9)' }}
          >
            <Heart size={18} fill={isWishlisted ? COLORS.danger : 'none'} color={isWishlisted ? COLORS.danger : COLORS.inkSoft} />
          </button>
        )}
        <button
          onClick={async () => {
            const url = `${window.location.origin}${window.location.pathname}?p=${product.id}`;
            const text = `Check out ${product.name} \u2014 ${url}`;
            if (navigator.share) {
              try { await navigator.share({ title: product.name, text, url }); } catch (e) { /* cancelled */ }
            } else {
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }
          }}
          className="absolute top-3 flex items-center justify-center rounded-full"
          style={{ right: onToggleWishlist ? 51 : 12, width: 36, height: 36, background: 'rgba(255,255,255,0.9)' }}
        >
          <Share2 size={17} color={COLORS.inkSoft} />
        </button>
      </div>

      {showFullImage && product.imageUrl && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', zIndex: 9999 }}
          onClick={() => setShowFullImage(false)}
        >
          <button onClick={() => setShowFullImage(false)} className="absolute top-4 right-4 flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)' }}>
            <X size={22} color="#fff" />
          </button>
          <img src={product.imageUrl} alt={product.name} className="w-full" style={{ maxHeight: '85vh', objectFit: 'contain' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {product.isNew && <Badge bg={COLORS.secondary}>{t('new')}</Badge>}
          {off > 0 && <Badge bg={COLORS.danger}>{off}% OFF</Badge>}
          {product.bestSeller && <Badge bg={COLORS.gold}>{t('bestseller')}</Badge>}
        </div>
        <h1 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 21, color: COLORS.ink }}>{product.name}</h1>
        {product.quantity && <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }}>{product.quantity}</p>}
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={13} fill={COLORS.gold} color={COLORS.gold} />
          <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft }}>
            {displayRating} {t('ratingText')}{productReviews.length > 0 ? ` \u00b7 ${productReviews.length} ${t('reviewText')}${productReviews.length === 1 || currentLang !== 'en' ? '' : 's'}` : ''}
          </span>
          <span style={{ color: COLORS.border }}>&bull;</span>
          <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: product.stock === 0 ? COLORS.danger : product.stock <= LOW_STOCK_THRESHOLD ? COLORS.gold : COLORS.secondary, fontWeight: 700 }}>
            {product.stock === 0 ? t('outOfStockLine') : product.stock <= LOW_STOCK_THRESHOLD ? t('onlyLeftOrderSoon', { n: product.stock }) : t('inStockCount', { n: product.stock })}
          </span>
        </div>
        <div className="mt-4"><PriceTag price={product.price} mrp={product.mrp} size="lg" /></div>

        <div className="mt-5">
          <h3 style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 4 }}>Description</h3>
          <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.6 }}>{product.desc}</p>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span style={{ fontFamily: bodyFont, fontSize: 12.5, fontWeight: 700, color: COLORS.ink }}>Quantity</span>
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full" style={{ border: `1px solid ${COLORS.border}` }}>
            <button onClick={() => setN(Math.max(1, n - 1))}><Minus size={14} color={COLORS.ink} /></button>
            <span style={{ fontFamily: monoFont, fontSize: 13, minWidth: 16, textAlign: 'center' }}>{n}</span>
            <button onClick={() => setN(Math.min(product.stock || 1, n + 1))}><Plus size={14} color={COLORS.ink} /></button>
          </div>
          {qty > 0 && <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.secondary, fontWeight: 700 }}>{qty} {t('alreadyInCart')}</span>}
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{t('ratingsAndReviews')}</h3>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12, color: COLORS.primary }}>
                {t('writeReview')}
              </button>
            )}
          </div>

          {showForm && (
            <div className="rounded-2xl p-3.5 mb-4 flex flex-col gap-2.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
              <input value={rName} onChange={(e) => setRName(e.target.value)} placeholder={t("yourName")} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setRRating(i)}>
                    <Star size={22} fill={i <= rRating ? COLORS.gold : 'none'} color={COLORS.gold} />
                  </button>
                ))}
              </div>
              <textarea value={rComment} onChange={(e) => setRComment(e.target.value)} placeholder={t("shareExperience")} rows={3} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none', resize: 'none' }} />
              {rError && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.danger }}>{rError}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setShowForm(false); setRError(''); }} className="flex-1 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.inkSoft, fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>{t("cancel")}</button>
                <button onClick={submitReview} disabled={submitting} className="flex-1 py-2.5 rounded-lg" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? '...' : t('submitReview')}
                </button>
              </div>
            </div>
          )}

          {productReviews.length === 0 ? (
            <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft }}>{t('noReviewsYet')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {productReviews.map((r) => (
                <div key={r.id} className="rounded-xl p-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{r.name}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={12} fill={i <= r.rating ? COLORS.gold : 'none'} color={COLORS.gold} />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.5, marginTop: 4 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed left-0 right-0 flex justify-center z-40" style={{ bottom: 58 }}>
        <div className="w-full flex gap-3 p-3" style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, maxWidth: 448, boxShadow: '0 -6px 18px rgba(43,32,19,0.10)' }}>
          <button
            onClick={() => onAdd(product, n)}
            disabled={product.stock === 0}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
            style={{ background: COLORS.cream, border: `2px solid ${COLORS.primary}`, color: COLORS.primaryDark, fontFamily: bodyFont, fontWeight: 700, fontSize: 13.5, opacity: product.stock === 0 ? 0.5 : 1 }}
          >
            <ShoppingCart size={16} /> {t('addToCart')}
          </button>
          <button
            onClick={() => onBuyNow(product, n)}
            disabled={product.stock === 0}
            className="flex-1 py-3 rounded-xl"
            style={{ background: product.stock === 0 ? COLORS.border : COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 13.5, boxShadow: product.stock === 0 ? 'none' : '0 4px 10px rgba(217,115,13,0.35)' }}
          >
            {t('buyNow')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage({ cartItems, updateQty, removeItem, subtotal, nav, products = [], onAdd, cart = {}, wishlist, onToggleWishlist }) {
  if (!cartItems.length) {
    const deals = products.filter((p) => p.deal || p.mrp > p.price);
    return (
      <div className="flex flex-col items-center py-20 gap-3 px-6">
        <ShoppingCart size={40} color={COLORS.inkSoft} />
        <p style={{ fontFamily: bodyFont, color: COLORS.ink, fontWeight: 700, fontSize: 14 }}>{t('emptyCart')}</p>
        <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 12, textAlign: 'center' }}>Explore our categories and add items you love.</p>
        <button onClick={() => nav('categories')} className="px-5 py-2.5 rounded-full mt-1" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Browse Categories</button>
        {!!deals.length && (
          <div className="w-full mt-6">
            <Rail products={deals} onOpen={(p) => nav('product', { id: p.id })} onAdd={onAdd} cart={cart} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="pb-32">
      <div className="p-4 flex flex-col gap-3">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3 p-3 rounded-2xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 56, height: 56, background: item.imageUrl ? '#fff' : `linear-gradient(135deg, ${item.g1}, ${item.g2})` }}>
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full" style={{ objectFit: 'cover' }} /> : <span style={{ fontSize: 24 }}>{item.emoji}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ ...clamp1, fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{item.name}</p>
              <p style={{ fontFamily: monoFont, fontSize: 12.5, color: COLORS.primaryDark, fontWeight: 700, marginTop: 3 }}>{money(item.price)}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2 px-2 py-1 rounded-full" style={{ border: `1px solid ${COLORS.border}` }}>
                  <button onClick={() => updateQty(item.id, item.qty - 1)}><Minus size={12} /></button>
                  <span style={{ fontFamily: monoFont, fontSize: 12, minWidth: 14, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} disabled={item.qty >= (item.stock ?? Infinity)} style={{ opacity: item.qty >= (item.stock ?? Infinity) ? 0.35 : 1 }}><Plus size={12} /></button>
                </div>
                {item.qty >= (item.stock ?? Infinity) && (
                  <span style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft }}>{t('maxInStock')}</span>
                )}
                <button onClick={() => removeItem(item.id)}><Trash2 size={14} color={COLORS.danger} /></button>
              </div>
            </div>
            <span style={{ fontFamily: monoFont, fontSize: 12.5, fontWeight: 700, color: COLORS.ink }}>{money(item.price * item.qty)}</span>
          </div>
        ))}
      </div>
      <div className="fixed left-0 right-0 flex justify-center z-40" style={{ bottom: 58 }}>
        <div className="w-full p-4 rounded-t-2xl" style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, maxWidth: 448, boxShadow: '0 -6px 18px rgba(43,32,19,0.10)' }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: bodyFont, fontSize: 13, color: COLORS.inkSoft }}>{t('subtotal')}</span>
            <span style={{ fontFamily: monoFont, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>{money(subtotal)}</span>
          </div>
          <button onClick={() => nav('checkout')} className="w-full py-3.5 rounded-xl" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14, boxShadow: '0 4px 10px rgba(217,115,13,0.35)' }}>{t('proceedToCheckout')}</button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ cartItems, subtotal, deliverySettings, nav, placeOrder }) {
  const [form, setForm] = useState({ name: '', mobile: '', address: '', pincode: '' });
  const [payment, setPayment] = useState('upi');
  const [zone, setZone] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [upiPending, setUpiPending] = useState(false);
  const [upiLink, setUpiLink] = useState('');

  useEffect(() => {
    if (form.pincode.length === 6) setZone(checkDeliveryZone(form.pincode, deliverySettings));
    else setZone(null);
  }, [form.pincode]);

  useEffect(() => {
    window.storage.get('mm-profile').then((r) => {
      if (r && r.value) {
        const saved = JSON.parse(r.value);
        setForm((f) => (f.name || f.mobile || f.address || f.pincode ? f : { name: saved.name || '', mobile: saved.mobile || '', address: saved.address || '', pincode: saved.pincode || '' }));
      }
    }).catch(() => {});
  }, []);

  const belowMin = subtotal < deliverySettings.minOrderValue;
  const deliveryCharge = subtotal >= deliverySettings.freeDeliveryThreshold ? 0 : deliverySettings.deliveryCharge;
  const total = subtotal + deliveryCharge;
  const shopClosed = !isShopOpen(deliverySettings);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setError('');
    if (shopClosed) return setError(`We're currently closed. We reopen at ${formatTime12(deliverySettings.openTime)}.`);
    if (!form.name.trim()) return setError(t('enterName'));
    if (!/^\d{10}$/.test(form.mobile)) return setError(t('enterMobile'));
    if (!form.address.trim()) return setError(t('enterAddress'));
    if (!zone || !zone.allowed) return setError(t("noDeliveryHere"));
    if (belowMin) return setError(`Minimum order value is ${money(deliverySettings.minOrderValue)}.`);

    if (payment === 'online' && RAZORPAY_ENABLED) {
      setPaying(true);
      const result = await payWithRazorpay({ amountRupees: total, shopName: deliverySettings.shopName, customerName: form.name, customerMobile: form.mobile });
      if (!result.success) { setPaying(false); return setError(result.error || 'Payment could not be completed.'); }
      await placeOrder({ ...form, payment, deliveryCharge, total, subtotal, area: zone.area, paymentId: result.paymentId });
      setPaying(false);
      return;
    }
    if (payment === 'upi') {
      if (!deliverySettings.upiId) return setError('UPI isn\u2019t set up yet. Please choose another payment method.');
      const link = buildUpiLink({ upiId: deliverySettings.upiId, amountRupees: total, shopName: deliverySettings.shopName, orderNote: `Order for ${form.name}` });
      setUpiLink(link);
      setUpiPending(true);
      return;
    }
    setPaying(true);
    await placeOrder({ ...form, payment, deliveryCharge, total, subtotal, area: zone.area });
    setPaying(false);
  };

  const [upiRef, setUpiRef] = useState('');
  const confirmUpiPaid = async () => {
    setPaying(true);
    await placeOrder({ ...form, payment, deliveryCharge, total, subtotal, area: zone.area, paymentId: upiRef.trim() || undefined });
    setPaying(false);
  };

  const [copied, setCopied] = useState(false);
  const copyUpiId = () => {
    navigator.clipboard.writeText(deliverySettings.upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  if (upiPending) {
    return (
      <div className="p-4 pb-10 flex flex-col items-center text-center pt-8">
        <div className="rounded-full flex items-center justify-center mb-4" style={{ width: 64, height: 64, background: COLORS.cream }}>
          <Smartphone size={28} color={COLORS.primary} />
        </div>
        <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 19, color: COLORS.ink }}>Pay via UPI</h2>
        <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, marginTop: 8, lineHeight: 1.6, maxWidth: 320 }}>
          Pay <strong>{money(total)}</strong> to <strong>{deliverySettings.upiId}</strong>.
        </p>

        <div className="mt-4 p-4 rounded-2xl text-left w-full" style={{ background: COLORS.cream, border: `1px solid ${COLORS.border}`, maxWidth: 320 }}>
          <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12, color: COLORS.ink, marginBottom: 8 }}>How to pay:</p>
          {[
            'Open the UPI app your bank account is actually on (GPay, PhonePe, Paytm, etc.) \u2014 not just whichever app opens by itself.',
            'In that app, tap Scan & Pay and scan the QR code below.',
            `Confirm the amount \u2014 ${money(total)} \u2014 and complete the payment in your app.`,
            'Come back here and tap "I\u2019ve Paid \u2014 Notify Shop".',
          ].map((step, i) => (
            <div key={i} className="flex gap-2.5" style={{ marginTop: i === 0 ? 0 : 8 }}>
              <span className="flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, borderRadius: 999, background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 10.5, marginTop: 1 }}>{i + 1}</span>
              <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.ink, lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-3 rounded-2xl" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`}
            alt="UPI payment QR code"
            width={220}
            height={220}
            style={{ display: 'block' }}
          />
        </div>
        <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, marginTop: 8 }}>Scan this with your UPI app&rsquo;s scanner</p>

        <button onClick={copyUpiId} className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full" style={{ border: `1px solid ${COLORS.border}` }}>
          <span style={{ fontFamily: monoFont, fontSize: 12.5, color: COLORS.ink }}>{deliverySettings.upiId}</span>
          <span style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 700, color: copied ? COLORS.secondary : COLORS.primary }}>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, marginTop: 14, maxWidth: 300 }}>
          Prefer not to scan? This button below opens whichever UPI app your phone defaults to \u2014 only use it if that&rsquo;s the app your bank account is on.
        </p>
        <button onClick={() => { window.location.href = upiLink; }} className="w-full mt-2 py-3 rounded-xl" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.ink, fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>
          Open in UPI App
        </button>

        <label className="w-full flex flex-col gap-1 mt-5 text-left" style={{ maxWidth: 320 }}>
          <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>UPI transaction / UTR number (optional)</span>
          <input value={upiRef} onChange={(e) => setUpiRef(e.target.value)} placeholder="From your payment app's success screen" className="px-3 py-2.5 rounded-lg w-full" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
          <span style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft }}>Adding this helps the shop confirm your payment faster.</span>
        </label>

        <button onClick={confirmUpiPaid} disabled={paying} className="w-full mt-4 py-3.5 rounded-xl" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14, opacity: paying ? 0.7 : 1 }}>
          {paying ? 'Opening WhatsApp...' : 'I\u2019ve Paid \u2014 Notify Shop'}
        </button>
        <button onClick={() => setUpiPending(false)} className="w-full mt-2.5 py-3" style={{ color: COLORS.inkSoft, fontFamily: bodyFont, fontSize: 12.5 }}>
          Cancel &amp; Change Payment Method
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      {shopClosed && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl" style={{ background: COLORS.dangerTint }}>
          <AlertCircle size={15} color={COLORS.danger} />
          <span style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.danger, fontWeight: 700 }}>We&rsquo;re currently closed. We reopen at {formatTime12(deliverySettings.openTime)}.</span>
        </div>
      )}
      <h2 style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 8 }}>Delivery Details</h2>
      <div className="flex flex-col gap-2.5">
        <input value={form.name} onChange={set('name')} placeholder={t("fullName")} className="px-4 py-3 rounded-xl" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none' }} />
        <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder={t("mobileNumber")} className="px-4 py-3 rounded-xl" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 13, outline: 'none' }} />
        <textarea value={form.address} onChange={set('address')} placeholder={t("deliveryAddress")} rows={3} className="px-4 py-3 rounded-xl" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none', resize: 'none' }} />
        <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder={t("pincode")} className="px-4 py-3 rounded-xl" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 13, outline: 'none' }} />

        {zone && zone.allowed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: COLORS.successTint }}>
            <CheckCircle2 size={15} color={COLORS.secondary} />
            <span style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.secondary, fontWeight: 700 }}>Great news, we deliver to {zone.area || 'your area'}!</span>
          </div>
        )}
        {zone && !zone.allowed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: COLORS.dangerTint }}>
            <AlertCircle size={15} color={COLORS.danger} />
            <span style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.danger, fontWeight: 700 }}>{t("noDeliveryHere")}</span>
          </div>
        )}
      </div>

      <h2 style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, margin: '18px 0 8px' }}>Payment Method</h2>
      <div className="flex flex-col gap-2">
        <button onClick={() => setPayment('upi')} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ border: `2px solid ${payment === 'upi' ? COLORS.primary : COLORS.border}` }}>
          <Smartphone size={17} color={COLORS.ink} />
          <span style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: COLORS.ink }}>UPI (Google Pay / PhonePe / Paytm)</span>
        </button>
        {payment === 'upi' && !deliverySettings.upiId && (
          <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.danger, paddingLeft: 4 }}>The shop hasn&rsquo;t added a UPI ID yet &mdash; this option won&rsquo;t work until Admin &rarr; Delivery has one set.</p>
        )}
        {payment === 'upi' && deliverySettings.upiId && (
          <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, paddingLeft: 4 }}>Opens your UPI app to pay {deliverySettings.upiId} directly. The shop confirms payment manually before packing your order.</p>
        )}
        <button onClick={() => setPayment('online')} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ border: `2px solid ${payment === 'online' ? COLORS.primary : COLORS.border}` }}>
          <CreditCard size={17} color={COLORS.ink} />
          <span style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: COLORS.ink }}>Card / Netbanking</span>
        </button>
        {payment === 'online' && !RAZORPAY_ENABLED && (
          <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, paddingLeft: 4 }}>Online payment gateway isn&rsquo;t connected yet &mdash; this will be recorded as your chosen method without collecting payment. See SETUP.md.</p>
        )}
      </div>

      <div className="mt-5 rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <div className="flex justify-between mb-1.5"><span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft }}>{t('subtotal')}</span><span style={{ fontFamily: monoFont, fontSize: 12.5, color: COLORS.ink }}>{money(subtotal)}</span></div>
        <div className="flex justify-between mb-1.5"><span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft }}>{t('deliveryCharge')}</span><span style={{ fontFamily: monoFont, fontSize: 12.5, color: deliveryCharge === 0 ? COLORS.secondary : COLORS.ink }}>{deliveryCharge === 0 ? t('free') : money(deliveryCharge)}</span></div>
        {belowMin && <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.danger, marginBottom: 6 }}>Minimum order value is {money(deliverySettings.minOrderValue)}. Add {money(deliverySettings.minOrderValue - subtotal)} more.</p>}
        {!belowMin && deliveryCharge > 0 && <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, marginBottom: 6 }}>Add {money(deliverySettings.freeDeliveryThreshold - subtotal)} more for free delivery.</p>}
        <div className="flex justify-between pt-2" style={{ borderTop: `1px dashed ${COLORS.border}` }}>
          <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13.5, color: COLORS.ink }}>{t('total')} Amount</span>
          <span style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 15, color: COLORS.ink }}>{money(total)}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl" style={{ background: COLORS.dangerTint }}>
          <AlertCircle size={15} color={COLORS.danger} />
          <span style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.danger }}>{error}</span>
        </div>
      )}

      <div className="fixed left-0 right-0 flex justify-center z-40" style={{ bottom: 58 }}>
        <div className="w-full p-4" style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, maxWidth: 448, boxShadow: '0 -6px 18px rgba(43,32,19,0.10)' }}>
          <button onClick={submit} disabled={paying || shopClosed} className="w-full py-3.5 rounded-xl" style={{ background: paying || shopClosed ? COLORS.border : COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14, boxShadow: paying || shopClosed ? 'none' : '0 4px 10px rgba(217,115,13,0.35)' }}>
            {shopClosed ? t('storeClosed') : paying ? t('openingWhatsapp') : payment === 'online' && RAZORPAY_ENABLED ? `Pay ${money(total)} Now` : payment === 'upi' ? `${t('payViaUpi')} \u00b7 ${money(total)}` : `${t('placeOrder')} \u00b7 ${money(total)}`}
          </button>
          <p style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft, textAlign: 'center', marginTop: 8, lineHeight: 1.4 }}>
            By placing this order, you agree to our{' '}
            <span onClick={() => nav('terms')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms &amp; Conditions</span>
            {' '}and{' '}
            <span onClick={() => nav('privacy')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function AboutPage({ deliverySettings, nav }) {
  const shopOpen = isShopOpen(deliverySettings);
  const waMsg = encodeURIComponent(`Hi ${deliverySettings.shopName || 'Kuljeet Store'}, I have a question about your store.`);
  return (
    <div className="p-4 pb-10 flex flex-col gap-5">
      <div className="rounded-2xl p-5 flex flex-col items-center text-center gap-2" style={{ background: `linear-gradient(135deg, ${COLORS.primary}1A, ${COLORS.rose}1A)`, border: `1px solid ${COLORS.border}` }}>
        <div className="rounded-2xl flex items-center justify-center" style={{ width: 56, height: 56, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.rose})` }}>
          <ShoppingBasket size={26} color="#fff" />
        </div>
        <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontStyle: 'italic', fontSize: 19, color: COLORS.ink }}>{deliverySettings.shopName || 'Kuljeet Store'}</h2>
        <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft }}>your neighbourhood, delivered</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="rounded-full" style={{ width: 6, height: 6, background: shopOpen ? COLORS.secondary : COLORS.danger }} />
          <span style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 700, color: shopOpen ? COLORS.secondary : COLORS.danger }}>
            {shopOpen ? `Open now \u00b7 Closes at ${formatTime12(deliverySettings.closeTime)}` : `Closed \u00b7 Opens at ${formatTime12(deliverySettings.openTime)}`}
          </span>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 6 }}>About Us</p>
        <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.6 }}>
          We're your local neighbourhood store, bringing everyday essentials, skincare, makeup, and household items
          straight to your door. We pick every order carefully and get it to you fast, because we know your time matters.
          Thank you for shopping with us and supporting a local business.
        </p>
      </div>

      <div>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 10 }}>Contact Us</p>
        <div className="flex flex-col gap-2.5">
          <a href={`https://wa.me/${deliverySettings.whatsappNumber}?text=${waMsg}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl p-3.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: '#25D3661A' }}>
              <MessageCircle size={17} color="#25D366" />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Chat on WhatsApp</p>
              <p style={{ fontFamily: monoFont, fontSize: 11.5, color: COLORS.inkSoft }}>+{deliverySettings.whatsappNumber}</p>
            </div>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </a>
          <a href={`tel:+${deliverySettings.whatsappNumber}`} className="flex items-center gap-3 rounded-xl p-3.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: `${COLORS.primary}1A` }}>
              <Smartphone size={17} color={COLORS.primary} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Call Us</p>
              <p style={{ fontFamily: monoFont, fontSize: 11.5, color: COLORS.inkSoft }}>+{deliverySettings.whatsappNumber}</p>
            </div>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </a>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 10 }}>Visit Us</p>
        <a href={deliverySettings.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliverySettings.shopArea)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl p-3.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, background: `${COLORS.rose}1A` }}>
            <MapPin size={17} color={COLORS.rose} />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{deliverySettings.shopArea}</p>
            <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>Get Directions</p>
          </div>
          <ChevronRight size={16} color={COLORS.inkSoft} />
        </a>
      </div>

      <div>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 10 }}>Get the App</p>
        <a href="/kuljeet-store.apk" download className="flex items-center gap-3 rounded-xl p-3.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: `${COLORS.secondary}1A` }}>
            <Smartphone size={17} color={COLORS.secondary} />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Download for Android</p>
            <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>Direct download &mdash; not on Play Store</p>
          </div>
          <ChevronRight size={16} color={COLORS.inkSoft} />
        </a>

        <div className="rounded-xl p-3.5 mt-2.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: `${COLORS.blue}1A` }}>
              <Smartphone size={17} color={COLORS.blue} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Install on iPhone / iPad</p>
              <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>Adds an app icon to your Home Screen</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 pl-1">
            {[
              'Open kuljeet-store.vercel.app in Safari (not Chrome).',
              'Tap the Share icon at the bottom of the screen.',
              'Scroll down and tap "Add to Home Screen".',
              'Tap "Add" in the top right \u2014 done!',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, background: `${COLORS.blue}1A`, marginTop: 1 }}>
                  <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 10, color: COLORS.blue }}>{i + 1}</span>
                </div>
                <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.4 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 10 }}>{t("help")}</p>
        <div className="flex flex-col gap-2.5">
          <button onClick={() => nav('profile')} className="w-full flex items-center gap-3 rounded-xl p-3.5 text-left" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: `${COLORS.primary}1A` }}>
              <Users size={17} color={COLORS.primary} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{t("myDetails")}</p>
            </div>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </button>
          <button onClick={() => nav('my-orders')} className="w-full flex items-center gap-3 rounded-xl p-3.5 text-left" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: `${COLORS.secondary}1A` }}>
              <Package size={17} color={COLORS.secondary} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{t("myOrders")}</p>
            </div>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </button>
          <button onClick={() => nav('faq')} className="w-full flex items-center gap-3 rounded-xl p-3.5 text-left" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: `${COLORS.blue}1A` }}>
              <ClipboardList size={17} color={COLORS.blue} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{t("faqTitle")}</p>
            </div>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </button>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 10 }}>{t("legal")}</p>
        <div className="flex flex-col gap-2.5">
          <button onClick={() => nav('terms')} className="flex items-center gap-3 rounded-xl p-3.5 text-left" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: `${COLORS.primary}1A` }}>
              <FileText size={17} color={COLORS.primary} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Terms &amp; Conditions</p>
            </div>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </button>
          <button onClick={() => nav('privacy')} className="flex items-center gap-3 rounded-xl p-3.5 text-left" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: `${COLORS.secondary}1A` }}>
              <ShieldCheck size={17} color={COLORS.secondary} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Privacy Policy</p>
            </div>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- ADMIN ---------------------------------- */
function LegalSection({ heading, children }) {
  return (
    <div>
      <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 6 }}>{heading}</p>
      <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function GamePage() {
  const GOOD_EMOJIS = ['\ud83e\uddf4', '\ud83e\udee7', '\ud83d\udc84', '\ud83e\udd6b', '\ud83e\uddc8', '\ud83c\udf39', '\ud83e\udea5', '\ud83e\uddfc'];
  const GAME_SECONDS = 120;
  const [items, setItems] = useState([]);
  const [basketX, setBasketX] = useState(50);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const fieldRef = useRef(null);
  const draggingRef = useRef(false);
  const pendingXRef = useRef(null);
  const rafIdRef = useRef(null);
  const basketXRef = useRef(50);
  useEffect(() => { basketXRef.current = basketX; }, [basketX]);
  const nextId = useRef(0);
  const spawnTimer = useRef(0);

  // Prevent the whole page from scrolling/bouncing while this screen is
  // open, so only the game field itself responds to touch \u2014 not the
  // page behind it.
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, []);

  useEffect(() => {
    window.storage.get('mm-game-highscore').then((r) => {
      if (r && r.value) setHighScore(Number(r.value) || 0);
    }).catch(() => {});
  }, []);

  const endGame = () => {
    setRunning(false);
    setGameOver(true);
    setScore((s) => {
      if (s > highScore) {
        setHighScore(s);
        window.storage.set('mm-game-highscore', String(s)).catch(() => {});
      }
      return s;
    });
  };

  const startGame = () => {
    setItems([]);
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setGameOver(false);
    setBasketX(50);
    spawnTimer.current = 0;
    setRunning(true);
  };

  // Falling-item loop
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      spawnTimer.current += 1;
      setItems((prev) => {
        let next = prev.map((it) => ({ ...it, y: it.y + it.speed }));
        // spawn a new item roughly every ~1.1s
        if (spawnTimer.current % 11 === 0) {
          next = [...next, {
            id: nextId.current++,
            x: 8 + Math.random() * 84,
            y: 0,
            speed: 2.2 + Math.random() * 1.6,
            emoji: GOOD_EMOJIS[Math.floor(Math.random() * GOOD_EMOJIS.length)],
          }];
        }
        // check catches at the basket line (~88%)
        const survivors = [];
        let scoreDelta = 0;
        for (const it of next) {
          if (it.y >= 84 && it.y <= 94 && Math.abs(it.x - basketXRef.current) < 6.5) {
            scoreDelta += 1;
            continue; // caught, remove, +1 star
          }
          if (it.y > 100) continue; // fell off screen, no penalty, just gone
          survivors.push(it);
        }
        if (scoreDelta) setScore((s) => s + scoreDelta);
        return survivors;
      });
    }, 90);
    return () => clearInterval(interval);
  }, [running]);

  // 2-minute countdown
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const moveBasket = (clientX) => {
    if (!fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(6, Math.min(94, pct)));
  };
  // Touch/pointer-move events can fire many times per frame, and calling
  // moveBasket (a state update + re-render) on every single one competes
  // with the game loop for the main thread, visibly slowing the falling
  // items down while dragging. This batches it to once per frame instead.
  const scheduleMove = (clientX) => {
    pendingXRef.current = clientX;
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (pendingXRef.current != null) moveBasket(pendingXRef.current);
    });
  };
  useEffect(() => () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current); }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const isNewBest = gameOver && score > 0 && score >= highScore;

  return (
    <div className="p-4 pb-10 flex flex-col items-center gap-4">

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Star size={15} fill={COLORS.gold} color={COLORS.gold} />
          <span style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{score}</span>
        </div>
        <span style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 15, color: running && timeLeft <= 10 ? COLORS.danger : COLORS.ink }}>{mins}:{secs}</span>
        <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>Best: {highScore}</span>
      </div>

      <div
        ref={fieldRef}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          height: 380, background: `linear-gradient(180deg, ${COLORS.cream}, ${COLORS.bg})`, border: `1px solid ${COLORS.border}`,
          touchAction: 'none', overscrollBehavior: 'contain', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        }}
        onPointerDown={(e) => {
          if (!running) return;
          draggingRef.current = true;
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          scheduleMove(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!running || !draggingRef.current) return;
          scheduleMove(e.clientX);
        }}
        onPointerUp={() => { draggingRef.current = false; }}
        onPointerCancel={() => { draggingRef.current = false; }}
      >
        {items.map((it) => (
          <span key={it.id} className="absolute" style={{ left: `${it.x}%`, top: `${it.y}%`, transform: 'translate(-50%, -50%)', fontSize: 28, pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
            {it.emoji}
          </span>
        ))}
        {running && (
          <span className="absolute" style={{ left: `${basketX}%`, top: '90%', transform: 'translate(-50%, -50%)', fontSize: 40, pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
            &#128722;
          </span>
        )}
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(0,0,0,0.35)' }}>
            {gameOver && (
              <>
                <p style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 22, color: '#fff' }}>Time&rsquo;s Up!</p>
                <p style={{ fontFamily: bodyFont, fontSize: 13, color: '#fff' }}>
                  You caught {score} star{score === 1 ? '' : 's'}{isNewBest ? ' \u2014 new best, you win! \ud83c\udf89' : ` \u2014 your best is ${highScore}`}
                </p>
              </>
            )}
            <button onClick={startGame} className="px-6 py-3 rounded-full" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 13.5 }}>
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MyOrdersPage({ deliverySettings }) {
  const [loading, setLoading] = useState(true);
  const [ordersList, setOrdersList] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    (async () => {
      if (!BACKEND_ENABLED) { setLoading(false); return; }
      try {
        const r = await window.storage.get('mm-my-orders');
        const ids = r && r.value ? JSON.parse(r.value) : [];
        if (!ids.length) { setLoading(false); return; }
        const results = await Promise.allSettled(ids.map((id) => sbRpc('get_order_by_id', { p_id: id })));
        const found = results
          .filter((res) => res.status === 'fulfilled' && res.value && res.value[0])
          .map((res) => mapSalesLogFromDb(res.value[0]))
          .sort((a, b) => b.createdAt - a.createdAt);
        setOrdersList(found);
      } catch (e) {
        console.error('Could not load order history:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-8 text-center"><p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft }}>Loading your orders&hellip;</p></div>;
  }

  return (
    <div className="p-4 pb-10">
      <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 16 }}>
        Shows orders placed from this device only \u2014 nothing here is linked to an account, so it won\u2019t appear on a different phone or browser.
      </p>
      {!ordersList.length && (
        <div className="flex flex-col items-center pt-10">
          <Package size={36} color={COLORS.border} />
          <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, marginTop: 10 }}>No orders placed from this device yet.</p>
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {ordersList.map((o) => (
          <button key={o.id} onClick={() => setViewOrder(o)} className="w-full flex items-center gap-3 rounded-xl p-3.5 text-left" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 12, color: COLORS.ink }}>{o.id}</p>
              <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {o.items.length} item{o.items.length === 1 ? '' : 's'}</p>
            </div>
            <p style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 13, color: COLORS.ink }}>{money(o.total)}</p>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </button>
        ))}
      </div>
      {viewOrder && <InvoiceOverlay order={viewOrder} deliverySettings={deliverySettings} onClose={() => setViewOrder(null)} />}
    </div>
  );
}

function ProfilePage() {
  const [form, setForm] = useState({ name: '', mobile: '', address: '', pincode: '' });
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.storage.get('mm-profile').then((r) => {
      if (r && r.value) setForm({ ...form, ...JSON.parse(r.value) });
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setSaved(false); };

  const save = () => {
    window.storage.set('mm-profile', JSON.stringify(form)).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }).catch(() => {});
  };

  const clearProfile = () => {
    window.storage.delete('mm-profile').then(() => {
      setForm({ name: '', mobile: '', address: '', pincode: '' });
    }).catch(() => {});
  };

  if (!loaded) return null;

  return (
    <div className="p-4 pb-10 flex flex-col gap-4">
      <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.6 }}>
        Save your details here once, and we&rsquo;ll fill them in automatically next time you check out. This is saved only on this device &mdash; we don&apos;t store it anywhere else, and nobody else can see it.
      </p>

      <label className="flex flex-col gap-1.5">
        <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft, fontWeight: 700 }}>{t('fullName')}</span>
        <input value={form.name} onChange={set('name')} placeholder="Your name" className="px-3.5 py-3 rounded-xl" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none' }} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft, fontWeight: 700 }}>{t('mobileNumber')}</span>
        <input value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile number" className="px-3.5 py-3 rounded-xl" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 13, outline: 'none' }} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft, fontWeight: 700 }}>{t('deliveryAddress')}</span>
        <textarea value={form.address} onChange={set('address')} placeholder="House no., street, landmark" rows={3} className="px-3.5 py-3 rounded-xl" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none', resize: 'none' }} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft, fontWeight: 700 }}>{t('pincode')}</span>
        <input value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" maxLength={6} className="px-3.5 py-3 rounded-xl" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 13, outline: 'none' }} />
      </label>

      <button onClick={save} className="w-full py-3.5 rounded-xl mt-2" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14 }}>
        {saved ? '\u2713' : t('saveMyDetails')}
      </button>
      <button onClick={clearProfile} className="w-full py-3" style={{ color: COLORS.danger, fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>
        {t("clearMyDetails")}
      </button>
    </div>
  );
}

function FAQPage({ deliverySettings }) {
  const [openIdx, setOpenIdx] = useState(0);
  const shopName = deliverySettings.shopName || 'Kuljeet Store';
  const faqs = [
    {
      q: 'Do you deliver to my area?',
      a: `We deliver to the pincodes listed as serviceable at checkout. Enter your pincode on the home page or at checkout to check if we cover your area.`,
    },
    {
      q: 'What payment methods do you accept?',
      a: `We currently accept UPI payments only, paid directly through your own UPI app (GPay, PhonePe, Paytm, etc.). We don't accept cash on delivery right now.`,
    },
    {
      q: 'How do I place an order?',
      a: `Add items to your cart, go to checkout, and fill in your details. When you tap the order button, it opens WhatsApp with your order details pre-filled \u2014 just hit send and we'll confirm it with you there.`,
    },
    {
      q: 'How long does delivery take?',
      a: `Delivery times can vary a bit depending on your area and how busy we are, but we get orders out as quickly as we can once confirmed. Feel free to ask us on WhatsApp for an estimate for your area.`,
    },
    {
      q: 'Can I cancel or change my order after placing it?',
      a: `Yes, message us on WhatsApp as soon as possible. If your order hasn't been packed or dispatched yet, we can usually cancel or update it.`,
    },
    {
      q: 'What if my order arrives damaged, wrong, or incomplete?',
      a: `Message us on WhatsApp within 48 hours of delivery with your order details and photos if possible, and we'll sort out a replacement or refund.`,
    },
    {
      q: 'Do you have a physical store I can visit?',
      a: `Message us on WhatsApp or check our About page for our contact details and current store timings.`,
    },
    {
      q: 'Is my payment and personal information safe?',
      a: `Yes. Payments go directly through your own UPI app \u2014 we never see your UPI PIN or banking details. See our Privacy Policy for more on how we handle your information.`,
    },
    {
      q: 'Do I need to create an account to shop?',
      a: `No account needed. Just browse, add items to your cart, and check out \u2014 your cart and wishlist are saved on your own device.`,
    },
  ];

  return (
    <div className="p-4 pb-10 flex flex-col gap-5">
      <div>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 4 }}>{t("faqTitle")}</p>
        <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft }}>{t('faqIntro')} {shopName}. {t('cantFind')} +{deliverySettings.whatsappNumber}.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {faqs.map((item, i) => {
          const open = openIdx === i;
          return (
            <div key={i} className="rounded-xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
              <button onClick={() => setOpenIdx(open ? -1 : i)} className="w-full flex items-center gap-3 p-3.5 text-left">
                <span className="flex-1" style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{item.q}</span>
                <ChevronDown size={16} color={COLORS.inkSoft} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
              {open && (
                <div className="px-3.5 pb-3.5" style={{ marginTop: -4 }}>
                  <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.6 }}>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TermsPage({ deliverySettings }) {
  const shopName = deliverySettings.shopName || 'Kuljeet Store';
  return (
    <div className="p-4 pb-10 flex flex-col gap-5">
      <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <LegalSection heading="1. About These Terms">
        <p>These Terms &amp; Conditions govern your use of {shopName} and any orders you place with us. By browsing this site or placing an order, you agree to these terms. If you don&apos;t agree, please don&apos;t use the site.</p>
      </LegalSection>

      <LegalSection heading="2. Orders">
        <p>Placing an order sends your order details to us directly on WhatsApp. An order is only confirmed once we reply to you on WhatsApp confirming it &mdash; adding items to your cart or reaching the checkout screen does not by itself confirm an order. We may decline or cancel an order, including for reasons like an item being out of stock or delivery not being available to your address, in which case we&apos;ll let you know.</p>
      </LegalSection>

      <LegalSection heading="3. Pricing">
        <p>All prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We try to keep prices and product information accurate, but errors can occasionally happen; if we find a pricing error on your order, we&apos;ll contact you before proceeding.</p>
      </LegalSection>

      <LegalSection heading="4. Payment">
        <p>We currently accept payment via UPI. Payment is made directly through your own UPI app to the UPI ID shown at checkout; we do not collect or store your UPI PIN or banking credentials at any point.</p>
      </LegalSection>

      <LegalSection heading="5. Delivery">
        <p>We deliver to the pincodes listed as serviceable at checkout. Delivery times are estimates and may vary due to factors outside our control, such as weather, traffic, or courier delays.</p>
      </LegalSection>

      <LegalSection heading="6. Cancellations, Returns &amp; Refunds">
        <p>Since orders are confirmed directly with us on WhatsApp, please contact us there as soon as possible if you need to cancel or change an order &mdash; we can usually accommodate this if the order hasn&apos;t been packed or dispatched yet. For issues with a delivered order, such as a damaged, incorrect, or missing item, contact us on WhatsApp within 48 hours of delivery with your order details and photos where relevant, and we&apos;ll work with you on a replacement or refund.</p>
      </LegalSection>

      <LegalSection heading="7. Product Information">
        <p>We make a genuine effort to keep product descriptions, images, and stock levels accurate and up to date. Actual products may vary slightly from images shown (e.g. packaging updates by the manufacturer).</p>
      </LegalSection>

      <LegalSection heading="8. Account &amp; Content">
        <p>You don&apos;t need to create an account to shop with us. If you leave a product review, you&apos;re confirming it reflects your genuine experience, and you agree we may display it publicly on the site.</p>
      </LegalSection>

      <LegalSection heading="9. Limitation of Liability">
        <p>We aren&apos;t liable for indirect or incidental losses arising from use of this site or delayed deliveries beyond our reasonable control. Nothing here limits any rights you have under Indian consumer protection law.</p>
      </LegalSection>

      <LegalSection heading="10. Changes to These Terms">
        <p>We may update these terms from time to time. Continuing to use the site or place orders after changes are posted means you accept the updated terms.</p>
      </LegalSection>

      <LegalSection heading="11. Contact Us">
        <p>Questions about these terms? Reach us on WhatsApp at +{deliverySettings.whatsappNumber}.</p>
      </LegalSection>
    </div>
  );
}

function PrivacyPage({ deliverySettings }) {
  const shopName = deliverySettings.shopName || 'Kuljeet Store';
  return (
    <div className="p-4 pb-10 flex flex-col gap-5">
      <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <LegalSection heading="1. Overview">
        <p>This Privacy Policy explains what information {shopName} collects when you use this site, and how it&apos;s used. We collect the minimum we need to take and deliver your order.</p>
      </LegalSection>

      <LegalSection heading="2. Information We Collect">
        <p>When you check out, we collect the details you enter: your name, mobile number, delivery address, and pincode. This information is sent directly to us via WhatsApp when you place an order and is not stored in any separate order database.</p>
      </LegalSection>

      <LegalSection heading="3. Information Stored On Your Device">
        <p>Your cart and wishlist are saved locally on your own device/browser so they&apos;re there next time you visit &mdash; we don&apos;t have access to this and it isn&apos;t sent to us until you actually check out.</p>
      </LegalSection>

      <LegalSection heading="4. Payments">
        <p>Payments are made directly through your own UPI app. We never see or store your UPI PIN, card numbers, or banking credentials &mdash; that happens entirely within your payment app.</p>
      </LegalSection>

      <LegalSection heading="5. Product Reviews">
        <p>If you submit a product review, the name and comment you provide are displayed publicly on the relevant product page.</p>
      </LegalSection>

      <LegalSection heading="6. How We Use Your Information">
        <p>We use the details you provide solely to fulfil your order &mdash; confirming it, delivering it, and contacting you if there&apos;s an issue. We don&apos;t sell your information to anyone.</p>
      </LegalSection>

      <LegalSection heading="7. WhatsApp">
        <p>Orders and support conversations happen over WhatsApp, which is operated by WhatsApp/Meta under their own privacy policy. Messages you send us there are subject to WhatsApp&apos;s terms in addition to this policy.</p>
      </LegalSection>

      <LegalSection heading="8. Data Security">
        <p>We take reasonable steps to protect the information you share with us. However, no method of transmission over the internet is 100% secure, so we can&apos;t guarantee absolute security.</p>
      </LegalSection>

      <LegalSection heading="9. Children's Privacy">
        <p>This site is not directed at children, and we don&apos;t knowingly collect information from anyone under 18.</p>
      </LegalSection>

      <LegalSection heading="10. Changes to This Policy">
        <p>We may update this policy from time to time; the &quot;Last updated&quot; date at the top will reflect the latest revision.</p>
      </LegalSection>

      <LegalSection heading="11. Contact Us">
        <p>Questions about how your information is handled? Reach us on WhatsApp at +{deliverySettings.whatsappNumber}.</p>
      </LegalSection>
    </div>
  );
}

/* ---------------------------------- ADMIN ---------------------------------- */
function AdminLogin({ onLogin, adminPassword }) {
  const [pw, setPw] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submitReal = async () => {
    setErr(''); setBusy(true);
    try {
      const session = await sbAuthLogin(email.trim(), pw);
      setAuthToken(session.access_token);
      await window.storage.set('mm-admin-refresh', session.refresh_token);
      onLogin(session.refresh_token, session.user && session.user.email ? session.user.email : email.trim());
    } catch (e) {
      setErr(e.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  };
  const submitLocal = () => (pw === adminPassword ? onLogin() : setErr('Incorrect password. Please try again.'));

  return (
    <div className="flex flex-col items-center px-6 pt-20">
      <div className="rounded-full flex items-center justify-center mb-4" style={{ width: 56, height: 56, background: COLORS.cream }}>
        <Lock size={24} color={COLORS.primary} />
      </div>
      <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 19, color: COLORS.ink }}>Admin Dashboard</h2>
      <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft, marginTop: 4, marginBottom: 20, textAlign: 'center' }}>Manage products, orders, delivery zones and more.</p>

      {BACKEND_ENABLED ? (
        <>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="w-full px-4 py-3 rounded-xl mb-2.5" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none' }} />
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl mb-3" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none' }} />
          {err && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.danger, marginBottom: 8 }}>{err}</p>}
          <button onClick={submitReal} disabled={busy} className="w-full py-3.5 rounded-xl" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14, opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Logging in...' : 'Login'}
          </button>
          <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, marginTop: 10, textAlign: 'center' }}>Log in with the admin account created in Supabase (Authentication &rarr; Users).</p>
        </>
      ) : (
        <>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter admin password" className="w-full px-4 py-3 rounded-xl mb-3" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none' }} />
          {err && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.danger, marginBottom: 8 }}>{err}</p>}
          <button onClick={submitLocal} className="w-full py-3.5 rounded-xl" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14 }}>
            Login
          </button>
        </>
      )}
    </div>
  );
}

function AdminTabs({ tab, setTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', Icon: BarChart3 },
    { id: 'products', label: 'Products', Icon: Package },
    { id: 'delivery', label: 'Delivery', Icon: Truck },
    { id: 'customers', label: 'Customers', Icon: Users },
    { id: 'security', label: 'Security', Icon: KeyRound },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-full flex-shrink-0" style={{ background: tab === t.id ? COLORS.ink : COLORS.cream }}>
          <t.Icon size={13} color={tab === t.id ? '#fff' : COLORS.inkSoft} />
          <span style={{ fontFamily: bodyFont, fontSize: 11.5, fontWeight: 700, color: tab === t.id ? '#fff' : COLORS.inkSoft }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function InvoiceOverlay({ order, deliverySettings, onClose }) {
  const gst = deliverySettings.gstNumber;
  // navigator.standalone is a legacy Apple-only flag that is true ONLY for an
  // installed iOS home-screen web app \u2014 it's undefined everywhere else,
  // including Android's own installed/standalone mode, where printing still
  // works fine. So this deliberately does NOT use a general "is this running
  // standalone" check, which would incorrectly hide Print on Android too.
  const isIOSStandalone = typeof window !== 'undefined' && window.navigator.standalone === true;

  const shareInvoiceText = async () => {
    const lines = [
      `Invoice \u2014 ${deliverySettings.shopName}`,
      `Order ${order.id}`,
      new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      '',
      `Billed to: ${order.name}`,
      `${order.address}, ${order.pincode}`,
      order.mobile,
      '',
      ...order.items.map((it) => `${it.name} x${it.qty} = ${money(it.price * it.qty)}`),
      '',
      `Subtotal: ${money(order.subtotal)}`,
      `Delivery: ${order.deliveryCharge === 0 ? 'FREE' : money(order.deliveryCharge)}`,
      `Total: ${money(order.total)}`,
      `Payment: ${paymentLabel(order.payment)}${order.paymentRef ? ` (Ref: ${order.paymentRef})` : ''}`,
    ];
    const text = lines.join('\n');
    if (navigator.share) {
      try { await navigator.share({ title: `Invoice ${order.id}`, text }); } catch (e) { /* cancelled */ }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 9999 }}>
      <div className="w-full flex flex-col" style={{ maxWidth: 448, maxHeight: '100vh', overflowY: 'auto', background: '#fff' }}>
        <div className="flex items-center justify-between px-4 py-3 no-print" style={{ borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Invoice</span>
          <div className="flex gap-2">
            {isIOSStandalone ? (
              <button onClick={shareInvoiceText} className="px-3 py-1.5 rounded-full" style={{ background: '#1a1a1a', color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 11.5 }}>Share Invoice</button>
            ) : (
              <button onClick={() => window.print()} className="px-3 py-1.5 rounded-full" style={{ background: '#1a1a1a', color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 11.5 }}>Print / Save PDF</button>
            )}
            <button onClick={onClose} className="px-3 py-1.5 rounded-full" style={{ border: '1px solid #ddd', fontFamily: bodyFont, fontWeight: 700, fontSize: 11.5, color: '#1a1a1a' }}>Close</button>
          </div>
        </div>
        {isIOSStandalone && (
          <p className="no-print" style={{ fontFamily: bodyFont, fontSize: 10.5, color: '#888', padding: '0 16px', marginTop: 8, lineHeight: 1.5 }}>
            Printing/saving as PDF isn&apos;t available inside the installed app on iPhone \u2014 that&apos;s an Apple limitation, not a bug. Open this site in Safari (not the Home Screen icon) to print or save as PDF, or use Share Invoice above to send it as text.
          </p>
        )}

        <div className="p-6" style={{ color: '#1a1a1a' }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 20 }}>{deliverySettings.shopName}</p>
              <p style={{ fontFamily: bodyFont, fontSize: 11, color: '#666', marginTop: 2, whiteSpace: 'pre-line' }}>{deliverySettings.shopArea}</p>
              {gst && <p style={{ fontFamily: monoFont, fontSize: 10.5, color: '#666', marginTop: 2 }}>GSTIN: {gst}</p>}
            </div>
            <div className="text-right">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>INVOICE</p>
              <p style={{ fontFamily: monoFont, fontSize: 11, color: '#666', marginTop: 2 }}>{order.id}</p>
              <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: '#666', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="mb-6">
            <p style={{ fontFamily: bodyFont, fontSize: 10, color: '#999', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>BILLED TO</p>
            <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>{order.name}</p>
            <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: '#555', marginTop: 2 }}>{order.address}, {order.pincode}</p>
            <p style={{ fontFamily: monoFont, fontSize: 11.5, color: '#555', marginTop: 2 }}>{order.mobile}</p>
          </div>

          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
                <th style={{ textAlign: 'left', padding: '6px 4px', fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700 }}>Item</th>
                <th style={{ textAlign: 'center', padding: '6px 4px', fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700 }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700 }}>Price</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px 4px', fontFamily: bodyFont, fontSize: 12 }}>{it.name}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', fontFamily: monoFont, fontSize: 12 }}>{it.qty}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: monoFont, fontSize: 12 }}>{money(it.price)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: monoFont, fontSize: 12 }}>{money(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col items-end mt-4 gap-1.5">
            <div className="flex justify-between" style={{ width: 200 }}>
              <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: '#555' }}>Subtotal</span>
              <span style={{ fontFamily: monoFont, fontSize: 11.5 }}>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between" style={{ width: 200 }}>
              <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: '#555' }}>Delivery</span>
              <span style={{ fontFamily: monoFont, fontSize: 11.5 }}>{order.deliveryCharge === 0 ? 'FREE' : money(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between mt-1 pt-1.5" style={{ width: 200, borderTop: '1.5px solid #1a1a1a' }}>
              <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>Total</span>
              <span style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 13 }}>{money(order.total)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4" style={{ borderTop: '1px solid #eee' }}>
            <p style={{ fontFamily: bodyFont, fontSize: 11, color: '#555' }}>Payment: {paymentLabel(order.payment)}{order.paymentRef ? ` (Ref: ${order.paymentRef})` : ''}</p>
          </div>

          <p style={{ fontFamily: bodyFont, fontSize: 10, color: '#999', textAlign: 'center', marginTop: 24 }}>Thank you for shopping with {deliverySettings.shopName}!</p>
        </div>
      </div>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}

function AdminOverview({ products, salesLog, onRefresh, onViewInvoice }) {
  const now = Date.now();
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday.getTime() - 6 * 86400000);
  const todaySales = salesLog.filter((o) => o.createdAt >= startOfToday.getTime());
  const weekSales = salesLog.filter((o) => o.createdAt >= startOfWeek.getTime());
  const revenue = salesLog.reduce((s, o) => s + o.total, 0);
  const kpis = [
    { label: 'Total Orders', value: salesLog.length, color: COLORS.primary },
    { label: 'Total Revenue', value: money(revenue), color: COLORS.secondary },
    { label: "Today's Sales", value: money(todaySales.reduce((s, o) => s + o.total, 0)), color: COLORS.gold },
    { label: "This Week's Sales", value: money(weekSales.reduce((s, o) => s + o.total, 0)), color: COLORS.rose },
  ];

  const bestSellerMap = {};
  salesLog.forEach((o) => {
    o.items.forEach((it) => {
      if (!bestSellerMap[it.name]) bestSellerMap[it.name] = 0;
      bestSellerMap[it.name] += it.qty;
    });
  });
  const bestSellers = Object.entries(bestSellerMap).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const maxQty = Math.max(1, ...bestSellers.map((b) => b.qty));

  if (!BACKEND_ENABLED) {
    return (
      <div className="p-4">
        <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 12.5, textAlign: 'center', marginTop: 40 }}>Sales reports need the store's backend connected.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-end mb-3">
        <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ border: `1px solid ${COLORS.border}` }}>
          <span style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 700, color: COLORS.ink }}>Refresh</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, marginBottom: 6 }}>{k.label}</p>
            <p style={{ fontFamily: monoFont, fontSize: 19, fontWeight: 700, color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 mb-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink, marginBottom: 12 }}>Best Sellers</p>
        {!bestSellers.length && <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft }}>No sales yet.</p>}
        <div className="flex flex-col gap-2.5">
          {bestSellers.map((b) => (
            <div key={b.name}>
              <div className="flex justify-between mb-1">
                <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.ink }}>{b.name}</span>
                <span style={{ fontFamily: monoFont, fontSize: 11.5, color: COLORS.inkSoft }}>{b.qty} sold</span>
              </div>
              <div className="w-full rounded-full" style={{ height: 7, background: COLORS.cream }}>
                <div className="rounded-full" style={{ height: 7, width: `${Math.max(6, (b.qty / maxQty) * 100)}%`, background: COLORS.primary }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink, padding: '14px 16px 8px' }}>Recent Orders</p>
        {!salesLog.length && <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft, padding: '0 16px 16px' }}>No orders logged yet.</p>}
        <div className="flex flex-col">
          {salesLog.slice(0, 30).map((o) => (
            <div key={o.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: monoFont, fontSize: 11.5, color: COLORS.ink, fontWeight: 700 }}>{o.id}</p>
                <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>{o.name} &bull; {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
              <p style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{money(o.total)}</p>
              <button onClick={() => onViewInvoice(o)} className="px-3 py-1.5 rounded-full" style={{ border: `1px solid ${COLORS.border}` }}>
                <span style={{ fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700, color: COLORS.primary }}>Invoice</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminProducts({ products, setProducts, categories, customCategories, setCustomCategories }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeMsg, setOptimizeMsg] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const fileInputRef = useRef(null);
  const [catForm, setCatForm] = useState({ name: '', emoji: '\ud83c\udff7\ufe0f', color: '#D9730D' });
  const [form, setForm] = useState({ name: '', category: categories[0].id, categories: [categories[0].id], price: '', mrp: '', stock: '', emoji: '\ud83d\udecd\ufe0f', quantity: '', desc: '', imageUrl: '' });
  const toggleCat = (setFn, current, id) => {
    const has = current.includes(id);
    const next = has ? current.filter((c) => c !== id) : [...current, id];
    setFn(next.length ? next : [id]); // never allow zero categories
  };
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, category: p.category, categories: p.categories && p.categories.length ? p.categories : [p.category], price: String(p.price), mrp: String(p.mrp), stock: String(p.stock), emoji: p.emoji, quantity: p.quantity || '', desc: p.desc || '', imageUrl: p.imageUrl || '' });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm(null); };
  const saveEdit = () => {
    if (!editForm.name.trim() || !editForm.price || !editForm.mrp) return;
    update(editingId, {
      name: editForm.name, category: editForm.categories[0], categories: editForm.categories, price: Number(editForm.price) || 0, mrp: Number(editForm.mrp) || 0,
      stock: Number(editForm.stock) || 0, emoji: editForm.emoji || '\ud83d\udecd\ufe0f', quantity: editForm.quantity, desc: editForm.desc, imageUrl: editForm.imageUrl,
    });
    cancelEdit();
  };
  const handleEditPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try { const dataUrl = await readImageAsDataUrl(file); setEditForm((f) => ({ ...f, imageUrl: dataUrl })); }
    catch (err) { console.error('Could not read photo:', err); }
  };

  const CSV_HEADERS = ['name', 'category', 'categories', 'price', 'mrp', 'stock', 'quantity', 'emoji', 'desc', 'imageUrl'];

  const downloadSample = () => {
    downloadTextFile('sample-products.csv', toCSV(CSV_HEADERS, [
      { name: 'Sample Face Wash', category: categories[0].id, categories: categories.slice(0, 2).map((c) => c.id).join(','), price: 199, mrp: 249, stock: 20, emoji: '\ud83e\uddf4', desc: 'A gentle daily face wash.', imageUrl: '' },
    ]));
  };

  const exportProducts = () => {
    downloadTextFile('kuljeet-store-products.csv', toCSV(CSV_HEADERS, products.map((p) => ({
      name: p.name, category: p.category, categories: (p.categories || [p.category]).join(','), price: p.price, mrp: p.mrp, stock: p.stock, quantity: p.quantity || '', emoji: p.emoji, desc: p.desc, imageUrl: p.imageUrl || '',
    }))));
  };

  const optimizeExistingPhotos = async () => {
    // Rough heuristic: a data URL over ~150KB of base64 text is almost
    // certainly an uncompressed photo from before this fix existed.
    const candidates = products.filter((p) => p.imageUrl && p.imageUrl.startsWith('data:') && p.imageUrl.length > 150000);
    if (!candidates.length) { setOptimizeMsg('All your photos are already optimized \u2014 nothing to do.'); return; }
    setOptimizing(true);
    setOptimizeMsg(`Optimizing ${candidates.length} photo${candidates.length > 1 ? 's' : ''}\u2026`);
    let done = 0;
    let failed = 0;
    for (const p of candidates) {
      try {
        const compressed = await compressDataUrl(p.imageUrl);
        if (BACKEND_ENABLED) {
          await sbUpdate('products', `id=eq.${p.id}`, toDbProductPatch({ imageUrl: compressed }));
        }
        setProducts((current) => current.map((cp) => (cp.id === p.id ? { ...cp, imageUrl: compressed } : cp)));
        done += 1;
        setOptimizeMsg(`Optimizing photos\u2026 ${done + failed}/${candidates.length}`);
      } catch (e) {
        console.error('Could not optimize photo for', p.id, e);
        failed += 1;
      }
    }
    setOptimizing(false);
    setOptimizeMsg(`Done \u2014 optimized ${done} photo${done === 1 ? '' : 's'}${failed ? `, ${failed} failed` : ''}.`);
  };
  const handleImportFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImportMsg('Importing\u2026');
    try {
      const text = await file.text();
      const rows = parseCSV(text).filter((r) => r.length && r.some((c) => c.trim() !== ''));
      if (rows.length < 2) { setImportMsg('That file has no product rows in it.'); return; }
      const headerRow = rows[0].map((h) => h.trim().toLowerCase());
      const validCatIds = new Set(categories.map((c) => c.id));
      const drafts = [];
      let skipped = 0;
      for (const r of rows.slice(1)) {
        const obj = {};
        headerRow.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
        if (!obj.name || !obj.price || !obj.mrp) { skipped++; continue; }
        const primaryCat = validCatIds.has(obj.category) ? obj.category : categories[0].id;
        const parsedCats = (obj.categories || '').split(',').map((c) => c.trim()).filter((c) => validCatIds.has(c));
        drafts.push({
          category: primaryCat, categories: parsedCats.length ? parsedCats : [primaryCat],
          name: obj.name, price: Number(obj.price) || 0, mrp: Number(obj.mrp) || 0,
          stock: Number(obj.stock) || 0, quantity: obj.quantity || '', emoji: obj.emoji || '\ud83d\udecd\ufe0f',
          desc: obj.desc || 'A trusted everyday pick from our store shelves.',
          imageUrl: obj.imageurl || '',
        });
      }
      if (!drafts.length) { setImportMsg('No valid rows found \u2014 check against the sample CSV format.'); return; }
      if (BACKEND_ENABLED) {
        const rowsToInsert = drafts.map((d, i) => {
          const [g1, g2] = grad(products.length + i);
          return { category: d.category, categories: d.categories, name: d.name, price: d.price, mrp: d.mrp, stock: d.stock, quantity: d.quantity || null, emoji: d.emoji, g1, g2, rating: 4.0, best_seller: false, is_new: true, deal: false, description: d.desc, image_url: d.imageUrl || null };
        });
        const inserted = await sbInsert('products', rowsToInsert);
        setProducts([...products, ...inserted.map(mapProductFromDb)]);
      } else {
        setProducts([...products, ...drafts.map((d, i) => {
          const [g1, g2] = grad(products.length + i);
          return { id: 'p' + Date.now() + i, ...d, rating: 4.0, g1, g2, bestSeller: false, isNew: true, deal: false };
        })]);
      }
      setImportMsg(`Added ${drafts.length} product${drafts.length > 1 ? 's' : ''}${skipped ? `, skipped ${skipped} incomplete row${skipped > 1 ? 's' : ''}` : ''}.`);
    } catch (err) {
      console.error('CSV import failed:', err);
      setImportMsg('Could not read that file \u2014 make sure it\u2019s a CSV exported from Excel or Google Sheets.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addCategory = () => {
    if (!catForm.name.trim()) return;
    const baseId = catForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let id = baseId || 'category';
    let n = 1;
    const existingIds = new Set(categories.map((c) => c.id));
    while (existingIds.has(id)) { id = `${baseId}-${n}`; n += 1; }
    setCustomCategories([...customCategories, { id, name: catForm.name.trim(), emoji: catForm.emoji || '\ud83c\udff7\ufe0f', color: catForm.color || '#D9730D' }]);
    setCatForm({ name: '', emoji: '\ud83c\udff7\ufe0f', color: '#D9730D' });
  };
  const removeCategory = (id) => setCustomCategories(customCategories.filter((c) => c.id !== id));

  const update = (id, patch) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    if (BACKEND_ENABLED) sbUpdate('products', `id=eq.${id}`, toDbProductPatch(patch)).catch((e) => console.error('Product update failed to sync:', e));
  };
  const remove = (id) => {
    const removedProduct = products.find((p) => p.id === id);
    setProducts(products.filter((p) => p.id !== id));
    setDeleteError('');
    if (BACKEND_ENABLED) {
      sbDelete('products', `id=eq.${id}`).catch((e) => {
        console.error('Product delete failed to sync:', e);
        // The delete didn't actually happen on the server, so put the
        // product back rather than letting it silently reappear later.
        setProducts((current) => (current.some((p) => p.id === id) ? current : [...current, removedProduct]));
        setDeleteError(`Couldn't delete "${removedProduct.name}" \u2014 please check your connection and try again.`);
      });
    }
  };
  const handleNewPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try { setForm((f) => ({ ...f, imageUrl: '' })); const dataUrl = await readImageAsDataUrl(file); setForm((f) => ({ ...f, imageUrl: dataUrl })); }
    catch (err) { console.error('Could not read photo:', err); }
  };
  const handleRowPhoto = (id) => async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try { const dataUrl = await readImageAsDataUrl(file); update(id, { imageUrl: dataUrl }); }
    catch (err) { console.error('Could not read photo:', err); }
  };
  const add = async () => {
    if (!form.name.trim() || !form.price || !form.mrp) return;
    const [g1, g2] = grad(products.length);
    const draft = {
      category: form.categories[0], categories: form.categories, name: form.name, price: Number(form.price), mrp: Number(form.mrp),
      stock: Number(form.stock) || 0, emoji: form.emoji || '\ud83d\udecd\ufe0f', quantity: form.quantity || '', rating: 4.0, g1, g2, bestSeller: false, isNew: true, deal: false, featured: false,
      desc: form.desc || 'A trusted everyday pick from our store shelves.', imageUrl: form.imageUrl || '',
    };
    if (BACKEND_ENABLED) {
      try {
        const rows = await sbInsert('products', [{
          category: draft.category, categories: draft.categories, name: draft.name, price: draft.price, mrp: draft.mrp, stock: draft.stock,
          emoji: draft.emoji, quantity: draft.quantity || null, g1, g2, rating: draft.rating, best_seller: false, is_new: true, deal: false, featured: false, description: draft.desc,
          image_url: draft.imageUrl || null,
        }]);
        setProducts([...products, mapProductFromDb(rows[0])]);
      } catch (e) {
        console.error('Could not save product to Supabase, added locally only:', e);
        setProducts([...products, { id: 'p' + Date.now(), ...draft }]);
      }
    } else {
      setProducts([...products, { id: 'p' + Date.now(), ...draft }]);
    }
    setForm({ name: '', category: categories[0].id, categories: [categories[0].id], price: '', mrp: '', stock: '', emoji: '\ud83d\udecd\ufe0f', quantity: '', desc: '', imageUrl: '' });
    setShowAdd(false);
  };

  return (
    <div className="p-4">
      <button onClick={() => setShowCats(!showCats)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-3" style={{ border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink }}>
        <Tag size={15} /> <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>{showCats ? 'Close Categories' : 'Manage Categories'}</span>
      </button>

      {showCats && (
        <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft }}>The 13 built-in categories are always available. Add your own below &mdash; they'll show up here, on the homepage, and in Shop by Category.</p>
          {customCategories.length > 0 && (
            <div className="flex flex-col gap-2">
              {customCategories.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: `${c.color}14` }}>
                  <span className="flex items-center gap-2">
                    <span style={{ fontSize: 16 }}>{c.emoji}</span>
                    <span style={{ fontFamily: bodyFont, fontSize: 12.5, fontWeight: 700, color: COLORS.ink }}>{c.name}</span>
                  </span>
                  <button onClick={() => removeCategory(c.id)}><Trash2 size={14} color={COLORS.danger} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Category name" className="flex-1 px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
            <input value={catForm.emoji} onChange={(e) => setCatForm({ ...catForm, emoji: e.target.value })} placeholder="Icon" className="w-16 px-2 py-2.5 rounded-lg text-center" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontSize: 15, outline: 'none' }} />
            <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-11 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, padding: 2 }} />
          </div>
          <button onClick={addCategory} className="py-2.5 rounded-lg" style={{ background: COLORS.ink, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Add Category</button>
        </div>
      )}

      <div className="rounded-2xl p-4 mb-4 flex flex-col gap-2.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Speed Up My Store</p>
        <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, lineHeight: 1.5 }}>
          Photos added before this update may still be full-size, which slows down how fast your store opens for everyone. This compresses any large photo already on your products, without changing how they look.
        </p>
        <button onClick={optimizeExistingPhotos} disabled={optimizing} className="py-2.5 rounded-lg" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, opacity: optimizing ? 0.7 : 1 }}>
          {optimizing ? 'Optimizing\u2026' : 'Optimize My Product Photos'}
        </button>
        {optimizeMsg && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.ink }}>{optimizeMsg}</p>}
      </div>

      <button onClick={() => setShowBulk(!showBulk)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-3" style={{ border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink }}>
        <ClipboardList size={15} /> <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>{showBulk ? 'Close Bulk Upload' : 'Bulk Upload / Export (CSV)'}</span>
      </button>

      {showBulk && (
        <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, lineHeight: 1.5 }}>
            Add many products at once from a spreadsheet, instead of one by one. Columns needed: name, category, categories, price, mrp, stock, emoji, desc, imageUrl (only name, price, mrp are required). To put a product in more than one category, list category IDs separated by commas in the "categories" column, e.g. "skincare,offers".
          </p>
          <button onClick={downloadSample} className="py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.ink, fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>
            Download Sample CSV
          </button>
          <button onClick={exportProducts} className="py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.ink, fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>
            Export My Current Products to CSV
          </button>
          <label className="py-2.5 rounded-lg text-center" style={{ background: COLORS.ink, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
            Import CSV File
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
          </label>
          {importMsg && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: importMsg.startsWith('Added') ? COLORS.secondary : COLORS.ink }}>{importMsg}</p>}
        </div>
      )}

      <button onClick={() => setShowAdd(!showAdd)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-4" style={{ background: COLORS.ink, color: '#fff' }}>
        <PlusCircle size={16} /> <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>{showAdd ? 'Close Form' : 'Add Product'}</span>
      </button>

      {showAdd && (
        <div className="rounded-2xl p-4 mb-4 flex flex-col gap-2.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
          <div>
            <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Categories (tap all that apply)</span>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {categories.map((c) => {
                const active = form.categories.includes(c.id);
                return (
                  <button key={c.id} type="button" onClick={() => toggleCat((next) => setForm({ ...form, categories: next, category: next[0] }), form.categories, c.id)} className="px-3 py-1.5 rounded-full" style={{ background: active ? COLORS.primary : COLORS.card, color: active ? '#fff' : COLORS.ink, border: `1px solid ${active ? COLORS.primary : COLORS.border}`, fontFamily: bodyFont, fontSize: 11.5, fontWeight: 700 }}>
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, '') })} placeholder="Selling price" className="flex-1 px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
            <input value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value.replace(/\D/g, '') })} placeholder="MRP" className="flex-1 px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
          </div>
          <div className="flex gap-2">
            <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/\D/g, '') })} placeholder="Stock quantity" className="flex-1 px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
            <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="Icon (emoji)" className="w-24 px-3 py-2.5 rounded-lg text-center" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontSize: 15, outline: 'none' }} />
          </div>
          <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="Pack size, e.g. 200ml, 500g, 1kg" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
          <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Description" rows={2} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none', resize: 'none' }} />
          <div className="flex items-center gap-3">
            <div className="rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 56, height: 56, background: COLORS.cream, border: `1px solid ${COLORS.border}` }}>
              {form.imageUrl ? <img src={form.imageUrl} alt="preview" className="w-full h-full" style={{ objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>{form.emoji}</span>}
            </div>
            <label className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg cursor-pointer" style={{ border: `1px dashed ${COLORS.primary}`, color: COLORS.primaryDark }}>
              <ImagePlus size={15} /> <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12 }}>{form.imageUrl ? 'Change Photo' : 'Add Photo'}</span>
              <input type="file" accept="image/*" onChange={handleNewPhoto} className="hidden" />
            </label>
          </div>
          <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft }}>Choose from your gallery or take a photo directly. Falls back to the emoji icon if no photo is added.</p>
          <button onClick={add} className="py-2.5 rounded-lg" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Save Product</button>
        </div>
      )}

      {deleteError && (
        <div className="rounded-xl p-3 mb-3 flex items-center gap-2" style={{ background: COLORS.dangerTint }}>
          <AlertCircle size={15} color={COLORS.danger} />
          <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.danger, flex: 1 }}>{deleteError}</p>
          <button onClick={() => setDeleteError('')}><X size={14} color={COLORS.danger} /></button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {products.map((p) => {
          const off = pctOff(Number(p.price), Number(p.mrp));
          if (editingId === p.id) {
            return (
              <div key={p.id} className="rounded-2xl p-4 flex flex-col gap-2.5" style={{ background: COLORS.card, border: `2px solid ${COLORS.primary}` }}>
                <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Edit Product</p>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Product name" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
                <div>
                  <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Categories (tap all that apply)</span>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {categories.map((c) => {
                      const active = (editForm.categories || [editForm.category]).includes(c.id);
                      return (
                        <button key={c.id} type="button" onClick={() => toggleCat((next) => setEditForm({ ...editForm, categories: next, category: next[0] }), editForm.categories || [editForm.category], c.id)} className="px-3 py-1.5 rounded-full" style={{ background: active ? COLORS.primary : COLORS.card, color: active ? '#fff' : COLORS.ink, border: `1px solid ${active ? COLORS.primary : COLORS.border}`, fontFamily: bodyFont, fontSize: 11.5, fontWeight: 700 }}>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value.replace(/\D/g, '') })} placeholder="Selling price" className="flex-1 px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
                  <input value={editForm.mrp} onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value.replace(/\D/g, '') })} placeholder="MRP" className="flex-1 px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
                </div>
                <div className="flex gap-2">
                  <input value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value.replace(/\D/g, '') })} placeholder="Stock quantity" className="flex-1 px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
                  <input value={editForm.emoji} onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })} placeholder="Icon (emoji)" className="w-24 px-3 py-2.5 rounded-lg text-center" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontSize: 15, outline: 'none' }} />
                </div>
                <input value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} placeholder="Pack size, e.g. 200ml, 500g, 1kg" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
                <textarea value={editForm.desc} onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })} placeholder="Description" rows={2} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none', resize: 'none' }} />
                <div className="flex items-center gap-3">
                  <div className="rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 56, height: 56, background: COLORS.cream, border: `1px solid ${COLORS.border}` }}>
                    {editForm.imageUrl ? <img src={editForm.imageUrl} alt="preview" className="w-full h-full" style={{ objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>{editForm.emoji}</span>}
                  </div>
                  <label className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg cursor-pointer" style={{ border: `1px dashed ${COLORS.primary}`, color: COLORS.primaryDark }}>
                    <ImagePlus size={15} /> <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12 }}>{editForm.imageUrl ? 'Change Photo' : 'Add Photo'}</span>
                    <input type="file" accept="image/*" onChange={handleEditPhoto} className="hidden" />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-2.5 rounded-lg" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Save Changes</button>
                  <button onClick={cancelEdit} className="flex-1 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.ink, fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Cancel</button>
                </div>
              </div>
            );
          }
          return (
            <div key={p.id} className="rounded-2xl p-3 flex gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="rounded-xl overflow-hidden flex items-center justify-center" style={{ width: 50, height: 50, background: p.imageUrl ? '#fff' : `linear-gradient(135deg, ${p.g1}, ${p.g2})`, border: `1px solid ${COLORS.border}` }}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full" style={{ objectFit: 'cover' }} loading="lazy" decoding="async" /> : <span style={{ fontSize: 22 }}>{p.emoji}</span>}
                </div>
                <label className="cursor-pointer" style={{ color: COLORS.primaryDark }}>
                  <ImagePlus size={13} />
                  <input type="file" accept="image/*" onChange={handleRowPhoto(p.id)} className="hidden" />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ ...clamp1, fontFamily: bodyFont, fontWeight: 700, fontSize: 12, color: COLORS.ink }}>{p.name}{p.quantity ? ` \u00b7 ${p.quantity}` : ''}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <label className="flex items-center gap-1"><span style={{ fontSize: 10, color: COLORS.inkSoft, fontFamily: bodyFont }}>Price</span>
                    <input type="text" value={p.price} onChange={(e) => update(p.id, { price: Number(e.target.value.replace(/\D/g, '')) || 0 })} className="w-16 px-1.5 py-1 rounded" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 11 }} />
                  </label>
                  <label className="flex items-center gap-1"><span style={{ fontSize: 10, color: COLORS.inkSoft, fontFamily: bodyFont }}>MRP</span>
                    <input type="text" value={p.mrp} onChange={(e) => update(p.id, { mrp: Number(e.target.value.replace(/\D/g, '')) || 0 })} className="w-16 px-1.5 py-1 rounded" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 11 }} />
                  </label>
                  <label className="flex items-center gap-1"><span style={{ fontSize: 10, color: COLORS.inkSoft, fontFamily: bodyFont }}>Stock</span>
                    <input type="text" value={p.stock} onChange={(e) => update(p.id, { stock: Number(e.target.value.replace(/\D/g, '')) || 0 })} className="w-14 px-1.5 py-1 rounded" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${p.stock === 0 ? COLORS.danger : p.stock <= LOW_STOCK_THRESHOLD ? COLORS.gold : COLORS.border}`, fontFamily: monoFont, fontSize: 11 }} />
                  </label>
                  {p.stock === 0 && <Badge bg={COLORS.danger}>OUT OF STOCK</Badge>}
                  {p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD && <Badge bg={COLORS.gold} color={COLORS.ink}>LOW STOCK</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.bestSeller} onChange={(e) => update(p.id, { bestSeller: e.target.checked })} /><span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.inkSoft }}>Bestseller</span></label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.isNew} onChange={(e) => update(p.id, { isNew: e.target.checked })} /><span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.inkSoft }}>New</span></label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.deal} onChange={(e) => update(p.id, { deal: e.target.checked })} /><span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.inkSoft }}>Deal</span></label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.featured} onChange={(e) => update(p.id, { featured: e.target.checked })} /><span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.inkSoft }}>Featured</span></label>
                  <span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.gold, fontWeight: 700 }}>{off > 0 ? off + '% off' : ''}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => startEdit(p)}><Pencil size={16} color={COLORS.primaryDark} /></button>
                <button onClick={() => remove(p.id)}><Trash2 size={16} color={COLORS.danger} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminDelivery({ settings, setSettings, categories }) {
  const [local, setLocal] = useState(settings);
  const [newPin, setNewPin] = useState({ pincode: '', area: '' });
  const save = () => {
    setSettings(local);
    if (BACKEND_ENABLED) {
      sbUpdate('delivery_settings', 'id=eq.1', {
        shop_name: local.shopName, shop_area: local.shopArea, shop_pincode: local.shopPincode, mode: local.mode, gst_number: local.gstNumber || null, maps_link: local.mapsLink || null,
        radius_km: local.radiusKm, min_order_value: local.minOrderValue, delivery_charge: local.deliveryCharge,
        free_delivery_threshold: local.freeDeliveryThreshold, whatsapp_number: local.whatsappNumber, upi_id: local.upiId,
        open_time: local.openTime, close_time: local.closeTime, manually_closed: local.manuallyClosed,
        banner_enabled: local.bannerEnabled, banner_title: local.bannerTitle, banner_subtitle: local.bannerSubtitle,
        banner_cta: local.bannerCta, banner_category: local.bannerCategory, banner_emoji: local.bannerEmoji,
        banner_color1: local.bannerColor1, banner_color2: local.bannerColor2,
        banner_start_date: local.bannerStartDate || null, banner_end_date: local.bannerEndDate || null,
      }).catch((e) => console.error('Delivery settings failed to sync:', e));
      const prevPins = new Set(settings.pincodes.map((p) => p.pincode));
      const nextPins = new Set(local.pincodes.map((p) => p.pincode));
      const added = local.pincodes.filter((p) => !prevPins.has(p.pincode));
      const removed = settings.pincodes.filter((p) => !nextPins.has(p.pincode));
      if (added.length) sbInsert('delivery_pincodes', added).catch((e) => console.error('Pincode add failed to sync:', e));
      removed.forEach((p) => sbDelete('delivery_pincodes', `pincode=eq.${p.pincode}`).catch((e) => console.error('Pincode delete failed to sync:', e)));
    }
  };
  const toggleShopOpen = () => {
    const next = { ...local, manuallyClosed: !local.manuallyClosed };
    setLocal(next);
    setSettings(next);
    if (BACKEND_ENABLED) {
      sbUpdate('delivery_settings', 'id=eq.1', { manually_closed: next.manuallyClosed }).catch((e) => console.error('Could not sync open/closed status:', e));
    }
  };
  const addPin = () => {
    if (!/^\d{6}$/.test(newPin.pincode) || !newPin.area.trim()) return;
    setLocal({ ...local, pincodes: [...local.pincodes, newPin] });
    setNewPin({ pincode: '', area: '' });
  };
  const removePin = (pin) => setLocal({ ...local, pincodes: local.pincodes.filter((p) => p.pincode !== pin) });

  const field = (label, value, onChange, mono) => (
    <label className="flex flex-col gap-1">
      <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>{label}</span>
      <input value={value} onChange={onChange} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: mono ? monoFont : bodyFont, fontSize: 12.5, outline: 'none' }} />
    </label>
  );

  return (
    <div className="p-4 flex flex-col gap-4 pb-10">
      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Shop Details</p>
        {field('Shop name', local.shopName, (e) => setLocal({ ...local, shopName: e.target.value }))}
        <label className="flex flex-col gap-1">
          <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Store address (shown on About page &amp; invoices)</span>
          <textarea value={local.shopArea} onChange={(e) => setLocal({ ...local, shopArea: e.target.value })} rows={4} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none', resize: 'none' }} />
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Google Maps link (optional, for precise directions)</span>
          <input value={local.mapsLink} onChange={(e) => setLocal({ ...local, mapsLink: e.target.value.trim() })} placeholder="https://maps.app.goo.gl/..." className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12, outline: 'none' }} />
          <p style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft, marginTop: 2, lineHeight: 1.5 }}>
            Open Google Maps on your phone \u2192 search for or drop a pin exactly on your shop \u2192 tap Share \u2192 Copy link \u2192 paste it here. This makes "Get Directions" go straight to your exact door, since text addresses alone aren\u2019t always precise enough.
          </p>
        </label>
        {field('Shop pincode', local.shopPincode, (e) => setLocal({ ...local, shopPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }), true)}
        {field('GST number (optional, shown on invoices)', local.gstNumber, (e) => setLocal({ ...local, gstNumber: e.target.value.toUpperCase() }))}
        {field('WhatsApp number (with country code, no +)', local.whatsappNumber, (e) => setLocal({ ...local, whatsappNumber: e.target.value.replace(/\D/g, '') }), true)}
        {field('UPI ID (for UPI payment option, e.g. name@okaxis)', local.upiId, (e) => setLocal({ ...local, upiId: e.target.value.trim() }), true)}
      </div>

      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Delivery Zone</p>
        <div className="flex gap-2">
          <button onClick={() => setLocal({ ...local, mode: 'pincode' })} className="flex-1 py-2 rounded-lg" style={{ background: local.mode === 'pincode' ? COLORS.ink : COLORS.cream, color: local.mode === 'pincode' ? '#fff' : COLORS.ink, fontFamily: bodyFont, fontSize: 11.5, fontWeight: 700 }}>Selected Pincodes</button>
          <button onClick={() => setLocal({ ...local, mode: 'radius' })} className="flex-1 py-2 rounded-lg" style={{ background: local.mode === 'radius' ? COLORS.ink : COLORS.cream, color: local.mode === 'radius' ? '#fff' : COLORS.ink, fontFamily: bodyFont, fontSize: 11.5, fontWeight: 700 }}>Radius from Shop</button>
        </div>

        {local.mode === 'pincode' ? (
          <div className="flex flex-col gap-2">
            {local.pincodes.map((p) => (
              <div key={p.pincode} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: COLORS.cream }}>
                <span style={{ fontFamily: monoFont, fontSize: 12, color: COLORS.ink }}>{p.pincode} <span style={{ fontFamily: bodyFont, color: COLORS.inkSoft }}>&mdash; {p.area}</span></span>
                <button onClick={() => removePin(p.pincode)}><X size={14} color={COLORS.danger} /></button>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <input value={newPin.pincode} onChange={(e) => setNewPin({ ...newPin, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="Pincode" className="w-24 px-2 py-2 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12 }} />
              <input value={newPin.area} onChange={(e) => setNewPin({ ...newPin, area: e.target.value })} placeholder="Area name" className="flex-1 px-2 py-2 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12 }} />
              <button onClick={addPin} className="px-3 rounded-lg" style={{ background: COLORS.primary, color: '#fff' }}><Plus size={14} /></button>
            </div>
          </div>
        ) : (
          <div>
            {field('Delivery radius (km)', local.radiusKm, (e) => setLocal({ ...local, radiusKm: Number(e.target.value.replace(/\D/g, '')) || 0 }), true)}
            <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, marginTop: 6 }}>This preview estimates distance from a small demo lookup table. Connect a maps/geocoding API in production for precise, real-time radius checks.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Store Timings</p>

        <div className="flex items-center justify-between rounded-xl p-3.5" style={{ background: local.manuallyClosed ? COLORS.dangerTint : COLORS.successTint }}>
          <div>
            <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: local.manuallyClosed ? COLORS.danger : COLORS.secondary }}>
              {local.manuallyClosed ? 'Shop is manually closed' : 'Shop is open'}
            </p>
            <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, marginTop: 2 }}>
              {local.manuallyClosed ? 'Overrides your scheduled hours below \u2014 no new orders can be placed.' : 'Following your scheduled hours below.'}
            </p>
          </div>
          <button onClick={toggleShopOpen} className="px-4 py-2 rounded-full flex-shrink-0" style={{ background: local.manuallyClosed ? COLORS.secondary : COLORS.danger, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12 }}>
            {local.manuallyClosed ? 'Reopen Shop' : 'Close Shop'}
          </button>
        </div>

        <div className="flex gap-3">
          <label className="flex-1 flex flex-col gap-1">
            <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Opens at</span>
            <input type="time" value={local.openTime} onChange={(e) => setLocal({ ...local, openTime: e.target.value })} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Closes at</span>
            <input type="time" value={local.closeTime} onChange={(e) => setLocal({ ...local, closeTime: e.target.value })} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
          </label>
        </div>
        <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft }}>Outside these hours the store shows as &ldquo;Closed&rdquo; to customers and new orders can&rsquo;t be placed.</p>
      </div>

      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Festive Banner</p>
          <button onClick={() => setLocal({ ...local, bannerEnabled: !local.bannerEnabled })} className="rounded-full" style={{ width: 42, height: 24, background: local.bannerEnabled ? COLORS.secondary : COLORS.border, position: 'relative', transition: 'background 0.15s' }}>
            <div className="rounded-full" style={{ width: 18, height: 18, background: COLORS.card, position: 'absolute', top: 3, left: local.bannerEnabled ? 21 : 3, transition: 'left 0.15s' }} />
          </button>
        </div>
        <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft, marginTop: -6 }}>Show a promotional banner at the top of the home page &mdash; turn it on for festivals or sales, off the rest of the time.</p>

        {local.bannerEnabled && (
          <div className="flex flex-col gap-3 mt-1">
            <div>
              <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Quick fill (optional)</span>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[
                  { name: 'Diwali', title: 'Diwali Dhamaka', subtitle: 'Flat 25% off on Gift Hampers', emoji: '\ud83e\udd6f', c1: '#C9971E', c2: '#8A1F1F' },
                  { name: 'Holi', title: 'Holi Hai!', subtitle: 'Colourful deals on your favourites', emoji: '\ud83c\udf88', c1: '#C13584', c2: '#5B3A9B' },
                  { name: 'Eid', title: 'Eid Mubarak', subtitle: 'Special Eid offers, just for you', emoji: '\ud83c\udf19', c1: '#0E6E5C', c2: '#146B3A' },
                  { name: 'Raksha Bandhan', title: 'Raksha Bandhan Special', subtitle: 'Gift ideas your siblings will love', emoji: '\ud83c\udf80', c1: '#D9730D', c2: '#B23A5C' },
                  { name: 'Christmas', title: 'Merry Christmas', subtitle: 'Festive deals all season long', emoji: '\ud83c\udf84', c1: '#146B3A', c2: '#B3282D' },
                  { name: 'New Year', title: 'New Year, New Deals', subtitle: 'Start the year with big savings', emoji: '\ud83c\udf86', c1: '#3E7FB0', c2: '#6B4A9E' },
                ].map((p) => (
                  <button key={p.name} onClick={() => setLocal({ ...local, bannerTitle: p.title, bannerSubtitle: p.subtitle, bannerEmoji: p.emoji, bannerColor1: p.c1, bannerColor2: p.c2 })} className="px-3 py-1.5 rounded-full" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 11.5, color: COLORS.ink, background: COLORS.card }}>
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>
              <p style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft, marginTop: 4 }}>Fills in the fields below \u2014 tweak anything after picking one.</p>
            </div>
            {field('Title (e.g. Diwali Dhamaka)', local.bannerTitle, (e) => setLocal({ ...local, bannerTitle: e.target.value }))}
            {field('Subtitle (e.g. Flat 25% off on Gift Hampers)', local.bannerSubtitle, (e) => setLocal({ ...local, bannerSubtitle: e.target.value }))}
            <div className="flex gap-3">
              {field('Button text', local.bannerCta, (e) => setLocal({ ...local, bannerCta: e.target.value }))}
              {field('Emoji', local.bannerEmoji, (e) => setLocal({ ...local, bannerEmoji: e.target.value }))}
            </div>
            <label className="flex flex-col gap-1">
              <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Button links to</span>
              <select value={local.bannerCategory} onChange={(e) => setLocal({ ...local, bannerCategory: e.target.value })} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }}>
                {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <div>
              <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Colour theme</span>
              <div className="flex gap-2.5 mt-2">
                {[
                  { name: 'Sale', c1: '#D9730D', c2: '#B23A5C' },
                  { name: 'Diwali', c1: '#C9971E', c2: '#8A1F1F' },
                  { name: 'Holi', c1: '#C13584', c2: '#5B3A9B' },
                  { name: 'Christmas', c1: '#146B3A', c2: '#B3282D' },
                  { name: 'Fresh', c1: '#0E6E5C', c2: '#1E8F73' },
                ].map((t) => (
                  <button key={t.name} onClick={() => setLocal({ ...local, bannerColor1: t.c1, bannerColor2: t.c2 })} title={t.name} className="rounded-full" style={{ width: 30, height: 30, background: `linear-gradient(135deg, ${t.c1}, ${t.c2})`, border: local.bannerColor1 === t.c1 && local.bannerColor2 === t.c2 ? `2px solid ${COLORS.ink}` : '2px solid transparent' }} />
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, fontWeight: 700 }}>Auto on/off (optional)</span>
              <div className="flex gap-3 mt-2">
                <label className="flex-1 flex flex-col gap-1">
                  <span style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft }}>Start date</span>
                  <input type="date" value={local.bannerStartDate} onChange={(e) => setLocal({ ...local, bannerStartDate: e.target.value })} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
                </label>
                <label className="flex-1 flex flex-col gap-1">
                  <span style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft }}>End date</span>
                  <input type="date" value={local.bannerEndDate} onChange={(e) => setLocal({ ...local, bannerEndDate: e.target.value })} className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
                </label>
              </div>
              <p style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft, marginTop: 4 }}>Leave blank to control it only with the switch above. Set both dates and the banner will show itself automatically during that window, and hide itself after \u2014 no need to come back and turn it off.</p>
            </div>
            <div className="rounded-2xl p-4 relative overflow-hidden mt-1" style={{ background: `linear-gradient(120deg, ${local.bannerColor1}, ${local.bannerColor2})` }}>
              <FestiveSparkles count={6} />
              <div className="relative" style={{ zIndex: 1 }}>
                <p style={{ fontFamily: bodyFont, fontSize: 10, color: '#FBE3B0', fontWeight: 700, letterSpacing: 0.5 }}>PREVIEW</p>
                <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontStyle: 'italic', fontSize: 20, color: '#fff', marginTop: 4, lineHeight: 1.15 }}>{local.bannerTitle || 'Your Banner Title'}</h2>
                <p style={{ fontFamily: bodyFont, fontSize: 12, color: '#fff', opacity: 0.9, marginTop: 2 }}>{local.bannerSubtitle || 'Your banner subtitle goes here'}</p>
                <button className="mt-3 px-4 py-2 rounded-full" style={{ background: COLORS.card, color: COLORS.primaryDark, fontFamily: bodyFont, fontWeight: 700, fontSize: 12 }}>{local.bannerCta || 'Shop Now'}</button>
              </div>
              <span className="absolute" style={{ right: -6, bottom: -14, fontSize: 64, opacity: 0.3 }}>{local.bannerEmoji || '\ud83c\udf89'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-4 grid grid-cols-1 gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Charges &amp; Order Rules</p>
        {field('Minimum order value (\u20b9)', local.minOrderValue, (e) => setLocal({ ...local, minOrderValue: Number(e.target.value.replace(/\D/g, '')) || 0 }), true)}
        {field('Delivery charge (\u20b9)', local.deliveryCharge, (e) => setLocal({ ...local, deliveryCharge: Number(e.target.value.replace(/\D/g, '')) || 0 }), true)}
        {field('Free delivery above (\u20b9)', local.freeDeliveryThreshold, (e) => setLocal({ ...local, freeDeliveryThreshold: Number(e.target.value.replace(/\D/g, '')) || 0 }), true)}
      </div>

      <button onClick={save} className="w-full py-3.5 rounded-xl" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14 }}>Save Delivery Settings</button>
    </div>
  );
}

function AdminSecurity({ adminPassword, setAdminPassword, adminEmail }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState(null); // { type: 'error' | 'success', text }
  const [busy, setBusy] = useState(false);

  const submitReal = async () => {
    setMsg(null);
    if (newPw.length < 6) return setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
    if (newPw !== confirmPw) return setMsg({ type: 'error', text: 'New password and confirmation don\u2019t match.' });
    setBusy(true);
    try {
      await sbAuthUpdatePassword(newPw);
      setNewPw(''); setConfirmPw('');
      setMsg({ type: 'success', text: 'Password updated. Use it next time you log in.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Could not update password.' });
    } finally {
      setBusy(false);
    }
  };
  const submitLocal = () => {
    if (currentPw !== adminPassword) return setMsg({ type: 'error', text: 'Current password is incorrect.' });
    if (newPw.length < 4) return setMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
    if (newPw !== confirmPw) return setMsg({ type: 'error', text: 'New password and confirmation don\u2019t match.' });
    setAdminPassword(newPw);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setMsg({ type: 'success', text: 'Password updated. Use it next time you log in.' });
  };

  return (
    <div className="p-4">
      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-2">
          <KeyRound size={16} color={COLORS.primary} />
          <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Change Admin Password</p>
        </div>
        {BACKEND_ENABLED ? (
          <>
            {adminEmail && <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft }}>Logged in as <span style={{ fontWeight: 700, color: COLORS.ink }}>{adminEmail}</span></p>}
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
            {msg && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: msg.type === 'error' ? COLORS.danger : COLORS.secondary }}>{msg.text}</p>}
            <button onClick={submitReal} disabled={busy} className="py-2.5 rounded-lg" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, opacity: busy ? 0.7 : 1 }}>{busy ? 'Updating...' : 'Update Password'}</button>
            <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft }}>This is your real login \u2014 the same one used in Supabase (Authentication &rarr; Users). It works the same on every device.</p>
          </>
        ) : (
          <>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="px-3 py-2.5 rounded-lg" style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
            {msg && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: msg.type === 'error' ? COLORS.danger : COLORS.secondary }}>{msg.text}</p>}
            <button onClick={submitLocal} className="py-2.5 rounded-lg" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Update Password</button>
            <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft }}>This password is stored only in this browser, not shared across devices, since Supabase isn\u2019t connected yet.</p>
          </>
        )}
      </div>
    </div>
  );
}

function AdminCustomers({ salesLog }) {
  const map = {};
  salesLog.forEach((o) => {
    if (!o.mobile) return;
    if (!map[o.mobile]) map[o.mobile] = { name: o.name, mobile: o.mobile, address: o.address, pincode: o.pincode, orders: 0, spent: 0 };
    map[o.mobile].orders += 1;
    map[o.mobile].spent += o.total;
    map[o.mobile].name = o.name;
    map[o.mobile].address = o.address;
  });
  const customers = Object.values(map).sort((a, b) => b.spent - a.spent);
  if (!BACKEND_ENABLED) {
    return (
      <div className="p-4">
        <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 12.5, textAlign: 'center', marginTop: 40 }}>Customer history needs the store's backend connected.</p>
      </div>
    );
  }
  return (
    <div className="p-4">
      {!customers.length && <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 12.5, textAlign: 'center', marginTop: 40 }}>No customers yet.</p>}
      <div className="flex flex-col gap-3">
        {customers.map((c) => (
          <div key={c.mobile} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: COLORS.cream, fontFamily: displayFont, fontWeight: 700, color: COLORS.primary }}>{c.name.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{c.name}</p>
              <p style={{ fontFamily: monoFont, fontSize: 11, color: COLORS.inkSoft }}>{c.mobile} &bull; {c.pincode}</p>
            </div>
            <div className="text-right">
              <p style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{money(c.spent)}</p>
              <p style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft }}>{c.orders} order{c.orders > 1 ? 's' : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPage({ products, setProducts, salesLog, refreshSalesLog, onViewInvoice, deliverySettings, setDeliverySettings, onLogout, adminPassword, setAdminPassword, allRealCategories, customCategories, setCustomCategories, adminEmail }) {
  const [tab, setTab] = useState('overview');
  return (
    <div className="pb-6">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <h1 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 17, color: COLORS.ink }}>Admin Dashboard</h1>
        <button onClick={onLogout} className="flex items-center gap-1"><LogOut size={15} color={COLORS.inkSoft} /><span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft }}>Logout</span></button>
      </div>
      <AdminTabs tab={tab} setTab={setTab} />
      {tab === 'overview' && <AdminOverview products={products} salesLog={salesLog} onRefresh={refreshSalesLog} onViewInvoice={onViewInvoice} />}
      {tab === 'products' && <AdminProducts products={products} setProducts={setProducts} categories={allRealCategories} customCategories={customCategories} setCustomCategories={setCustomCategories} />}
      {tab === 'delivery' && <AdminDelivery settings={deliverySettings} setSettings={setDeliverySettings} categories={allRealCategories} />}
      {tab === 'customers' && <AdminCustomers salesLog={salesLog} />}
      {tab === 'security' && <AdminSecurity adminPassword={adminPassword} setAdminPassword={setAdminPassword} adminEmail={adminEmail} />}
    </div>
  );
}

/* ------------------------------------ APP ------------------------------------ */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState('light');
  const [lang, setLangState] = useState('en');
  setLang(lang); // mutate the shared currentLang before this render's JSX reads it via t()
  const [deliverySettings, setDeliverySettings] = useState(SEED_DELIVERY);
  applyTheme(theme, deliverySettings); // mutate the shared COLORS object before this render's JSX reads it
  const [products, setProducts] = useState([]);
  const [salesLog, setSalesLog] = useState([]);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [cart, setCart] = useState({});
  const [route, setRoute] = useState({ page: 'home', params: {} });
  const [query, setQuery] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const refreshSalesLog = async () => {
    if (!BACKEND_ENABLED) return;
    try {
      const rows = await sbSelect('sales_log', '?select=*&order=created_at.desc&limit=500');
      setSalesLog(rows.map(mapSalesLogFromDb));
    } catch (e) { console.error('Failed to load sales log:', e); }
  };
  useEffect(() => { if (isAdmin) refreshSalesLog(); }, [isAdmin]);
  const [adminEmail, setAdminEmail] = useState('');
  const adminRefreshRef = useRef(null);
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [customCategories, setCustomCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState({});

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,600&family=Manrope:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => {
    (async () => {
      // Cart, saved location, the admin password, and custom categories are always local
      // to this browser, regardless of whether a Supabase backend is connected.
      try {
        const results = await Promise.allSettled([
          window.storage.get('mm-cart'),
          window.storage.get('mm-location'),
          window.storage.get('mm-admin-pw'),
          window.storage.get('mm-custom-categories'),
          window.storage.get('mm-theme'),
          window.storage.get('mm-wishlist'),
          window.storage.get('mm-lang'),
        ]);
        const [c, loc, pw, cc, th, wl, lg] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));
        if (c && c.value) setCart(JSON.parse(c.value));
        if (loc && loc.value) { setDeliveryArea(loc.value); setShowLocationModal(false); }
        if (pw && pw.value) setAdminPassword(pw.value);
        if (cc && cc.value) setCustomCategories(JSON.parse(cc.value));
        if (th && th.value) setTheme(th.value);
        if (wl && wl.value) setWishlist(JSON.parse(wl.value));
        if (lg && lg.value) setLangState(lg.value);
      } catch (e) { /* keep defaults */ }

      if (BACKEND_ENABLED) {
        try {
          const savedRefresh = await window.storage.get('mm-admin-refresh');
          if (savedRefresh && savedRefresh.value) {
            const session = await sbAuthRefresh(savedRefresh.value);
            setAuthToken(session.access_token);
            adminRefreshRef.current = session.refresh_token;
            window.storage.set('mm-admin-refresh', session.refresh_token).catch(() => {});
            setAdminEmail(session.user && session.user.email ? session.user.email : '');
            setIsAdmin(true);
          }
        } catch (e) {
          window.storage.delete('mm-admin-refresh').catch(() => {});
        }
        try {
          const [prodRows, settingsRows, pinRows] = await Promise.all([
            sbSelect('products', '?select=*'),
            sbSelect('delivery_settings', '?select=*&id=eq.1'),
            sbSelect('delivery_pincodes', '?select=*'),
          ]);
          if (prodRows) {
            setProducts(prodRows.map(mapProductFromDb));
          }
          if (settingsRows && settingsRows[0]) {
            const mapped = mapDeliveryFromDb(settingsRows[0], pinRows || []);
            setDeliverySettings(mapped);
            setAdminPassword(mapped.adminPassword);
          }
          // Reviews aren't needed for the very first paint (nobody sees them
          // until they open a product), so load them in the background
          // instead of making everyone wait on a third round-trip before
          // the store is even visible.
          sbSelect('reviews', '?select=*&order=created_at.desc')
            .then((reviewRows) => { if (reviewRows) setReviews(reviewRows.map(mapReviewFromDb)); })
            .catch((e) => console.error('Could not load reviews (has fix-reviews.sql been run yet?):', e));
        } catch (e) {
          console.error('Supabase load failed, showing local demo data instead:', e);
        }
        setLoaded(true);
        return;
      }
      try {
        const results = await Promise.allSettled([
          window.storage.get('mm-products'),
          window.storage.get('mm-delivery'),
          window.storage.get('mm-reviews'),
        ]);
        const [p, d, rv] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));
        if (p && p.value) setProducts(JSON.parse(p.value));
        if (d && d.value) setDeliverySettings({ ...SEED_DELIVERY, ...JSON.parse(d.value) });
        if (rv && rv.value) setReviews(JSON.parse(rv.value));
      } catch (e) { /* fall back to seed data */ }
      setLoaded(true);
    })();
  }, []);

  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (!loaded || deepLinkHandled.current || !products.length) return;
    deepLinkHandled.current = true;
    try {
      const pid = new URLSearchParams(window.location.search).get('p');
      if (pid && products.some((p) => p.id === pid)) {
        setRoute({ page: 'product', params: { id: pid } });
      }
    } catch (e) { /* ignore malformed URL */ }
  }, [loaded, products]);

  const pageLinkHandled = useRef(false);
  useEffect(() => {
    if (!loaded || pageLinkHandled.current) return;
    pageLinkHandled.current = true;
    try {
      const page = new URLSearchParams(window.location.search).get('page');
      const allowed = ['privacy', 'terms', 'faq', 'about'];
      if (page && allowed.includes(page)) {
        setShowLocationModal(false);
        setRoute({ page, params: {} });
      }
    } catch (e) { /* ignore malformed URL */ }
  }, [loaded]);

  useEffect(() => { if (loaded && !BACKEND_ENABLED) window.storage.set('mm-products', JSON.stringify(products)).catch(() => {}); }, [products, loaded]);
  useEffect(() => { if (loaded && !BACKEND_ENABLED) window.storage.set('mm-delivery', JSON.stringify(deliverySettings)).catch(() => {}); }, [deliverySettings, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-cart', JSON.stringify(cart)).catch(() => {}); }, [cart, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-wishlist', JSON.stringify(wishlist)).catch(() => {}); }, [wishlist, loaded]);
  useEffect(() => { if (loaded && !BACKEND_ENABLED) window.storage.set('mm-reviews', JSON.stringify(reviews)).catch(() => {}); }, [reviews, loaded]);
  useEffect(() => {
    if (!loaded) return;
    if (BACKEND_ENABLED) sbUpdate('delivery_settings', 'id=eq.1', { admin_password: adminPassword }).catch((e) => console.error('Admin password failed to sync:', e));
    else window.storage.set('mm-admin-pw', adminPassword).catch(() => {});
  }, [adminPassword, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-custom-categories', JSON.stringify(customCategories)).catch(() => {}); }, [customCategories, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-theme', theme).catch(() => {}); }, [theme, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-lang', lang).catch(() => {}); }, [lang, loaded]);
  useEffect(() => {
    if (!BACKEND_ENABLED || !isAdmin) return;
    const interval = setInterval(async () => {
      if (!adminRefreshRef.current) return;
      try {
        const session = await sbAuthRefresh(adminRefreshRef.current);
        setAuthToken(session.access_token);
        adminRefreshRef.current = session.refresh_token;
        window.storage.set('mm-admin-refresh', session.refresh_token).catch(() => {});
      } catch (e) { /* will require re-login on next admin action if this keeps failing */ }
    }, 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const nav = (page, params = {}) => { setRoute({ page, params }); window.scrollTo(0, 0); };

  const customCategoriesWithIcon = useMemo(
    () => customCategories.map((c) => ({ ...c, Icon: EmojiIconFactory(c.emoji) })),
    [customCategories]
  );
  const allRealCategories = useMemo(() => [...REAL_CATEGORIES, ...customCategoriesWithIcon], [customCategoriesWithIcon]);
  const allCategories = useMemo(
    () => [...REAL_CATEGORIES, ...customCategoriesWithIcon, ...CATEGORIES.filter((c) => c.virtual)],
    [customCategoriesWithIcon]
  );

  const addToCart = (product, n = 1) => {
    setCart((c) => {
      const current = c[product.id] || 0;
      const stock = product.stock ?? Infinity;
      const next = Math.min(current + n, stock);
      if (next <= 0) return c;
      return { ...c, [product.id]: next };
    });
  };
  const updateQty = (id, qty) => {
    if (qty <= 0) { const c = { ...cart }; delete c[id]; setCart(c); return; }
    const product = products.find((p) => p.id === id);
    const stock = product ? (product.stock ?? Infinity) : Infinity;
    setCart((c) => ({ ...c, [id]: Math.min(qty, stock) }));
  };
  const removeItem = (id) => { const c = { ...cart }; delete c[id]; setCart(c); };

  const toggleWishlist = (id) => {
    setWishlist((w) => {
      const n = { ...w };
      if (n[id]) delete n[id]; else n[id] = true;
      return n;
    });
  };

  const addReview = async (productId, { name, rating, comment }) => {
    if (BACKEND_ENABLED) {
      const rows = await sbInsert('reviews', [{ product_id: productId, customer_name: name, rating, comment }]);
      setReviews((r) => [mapReviewFromDb(rows[0]), ...r]);
    } else {
      const local = { id: `local-${Date.now()}`, productId, name, rating, comment, createdAt: Date.now() };
      setReviews((r) => [local, ...r]);
    }
  };

  const cartItems = useMemo(() => Object.entries(cart).map(([id, qty]) => {
    const p = products.find((p) => p.id === id);
    return p ? { ...p, qty } : null;
  }).filter(Boolean), [cart, products]);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const buyNow = (product, n) => { addToCart(product, n); nav('checkout'); };

  const placeOrder = (data) => {
    const orderId = 'ORD' + String(Date.now()).slice(-6);
    const items = cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }));
    const upiCheckNote = data.payment === 'upi' ? '\n\u26a0\ufe0f Please verify this payment has actually been received in your UPI/bank app before packing this order.' : '';
    const msg = `New order ${orderId} from ${data.name} (${data.mobile}).\nAddress: ${data.address}, ${data.pincode} (${data.area || ''}).\nItems:\n${items.map((i) => `- ${i.name} x${i.qty} = ${money(i.price * i.qty)}`).join('\n')}\nDelivery: ${data.deliveryCharge === 0 ? 'FREE' : money(data.deliveryCharge)}\nTotal: ${money(data.total)}\nPayment: ${paymentLabel(data.payment)}${data.paymentId ? ' (Ref: ' + data.paymentId + ')' : ''}${upiCheckNote}`;
    const waLink = `https://wa.me/${deliverySettings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    if (BACKEND_ENABLED) {
      sbRpc('decrement_stock', { items: items.map((i) => ({ id: i.id, qty: i.qty })) }).catch((e) => console.error('Stock decrement failed to sync:', e));
      sbInsert('sales_log', [{
        id: orderId, customer_name: data.name, customer_mobile: data.mobile, customer_address: data.address, customer_pincode: data.pincode,
        items, subtotal: data.subtotal, delivery_charge: data.deliveryCharge, total: data.total, payment: data.payment, payment_ref: data.paymentId || null,
      }]).catch((e) => console.error('Sales log failed to sync:', e));
    }
    setProducts(products.map((p) => {
      const bought = items.find((i) => i.id === p.id);
      return bought ? { ...p, stock: Math.max((p.stock ?? 0) - bought.qty, 0) } : p;
    }));
    window.storage.set('mm-profile', JSON.stringify({ name: data.name, mobile: data.mobile, address: data.address, pincode: data.pincode })).catch(() => {});
    if (BACKEND_ENABLED) {
      window.storage.get('mm-my-orders').then((r) => {
        const ids = r && r.value ? JSON.parse(r.value) : [];
        window.storage.set('mm-my-orders', JSON.stringify([orderId, ...ids].slice(0, 50))).catch(() => {});
      }).catch(() => {
        window.storage.set('mm-my-orders', JSON.stringify([orderId])).catch(() => {});
      });
    }
    setCart({});
    window.location.href = waLink;
  };

  const filteredForSearch = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.categories || [p.category]).some((cid) => allCategories.find((c) => c.id === cid)?.name.toLowerCase().includes(q)));
  }, [query, products, allCategories]);

  const runSearch = () => { if (query.trim()) nav('list', { title: `Results for "${query}"`, filter: 'search' }); };

  let categoryProducts = [];
  if (route.page === 'category') {
    const cat = allCategories.find((c) => c.id === route.params.id);
    if (cat?.virtual === 'isNew') categoryProducts = products.filter((p) => p.isNew);
    else if (cat?.virtual === 'deal') categoryProducts = products.filter((p) => p.deal || p.mrp > p.price);
    else categoryProducts = products.filter((p) => productInCategory(p, route.params.id));
  }

  let listProducts = [];
  let listTitle = '';
  if (route.page === 'list') {
    listTitle = route.params.title || 'Products';
    if (route.params.filter === 'bestSeller') listProducts = products.filter((p) => p.bestSeller);
    else if (route.params.filter === 'search') listProducts = filteredForSearch;
  }

  const currentProduct = route.page === 'product' ? products.find((p) => p.id === route.params.id) : null;

  const isAdminRoute = route.page === 'admin';
  const showHeader = !isAdminRoute && route.page !== 'product' && route.page !== 'checkout';
  const showBackHeader = route.page === 'category' || route.page === 'product' || route.page === 'checkout' || route.page === 'list' || route.page === 'about' || route.page === 'terms' || route.page === 'privacy' || route.page === 'faq' || route.page === 'profile' || route.page === 'my-orders' || route.page === 'game';

  const headerTitleMap = {
    category: allCategories.find((c) => c.id === route.params.id)?.name,
    product: currentProduct?.name,
    checkout: t('checkout'),
    list: listTitle,
    about: t('aboutUsContact'),
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    faq: t('faqTitle'),
    profile: t('myDetails'),
    'my-orders': t('myOrders'),
    game: 'Catch the Products',
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme === 'dark' ? COLORS.bg : '#FFF3B0' }}>
        <p style={{ fontFamily: displayFont, fontStyle: 'italic', fontSize: 18, color: COLORS.primary }}>Loading Kuljeet Store&hellip;</p>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen flex justify-center app-shell" style={{ background: theme === 'dark' ? COLORS.bg : 'linear-gradient(180deg, #FFF3B0 0%, #FBF6EC 600px)', fontFamily: bodyFont }}>
      <div className="w-full flex flex-col" style={{ maxWidth: 448, minHeight: '100vh', background: theme === 'dark' ? COLORS.bg : 'linear-gradient(180deg, #FFF3B0 0%, #FBF6EC 600px)', boxShadow: '0 0 40px rgba(0,0,0,0.06)' }}>
        {showLocationModal && !isAdminRoute && (
          <LocationModal
            deliverySettings={deliverySettings}
            onClose={() => setShowLocationModal(false)}
            onConfirm={(pin, result) => {
              setDeliveryArea(result.area || `Pincode ${pin}`);
              window.storage.set('mm-location', result.area || `Pincode ${pin}`).catch(() => {});
              setShowLocationModal(false);
            }}
          />
        )}

        {!isAdminRoute && (
          showBackHeader ? (
            <Header title={headerTitleMap[route.page] || ''} onBack={() => nav(route.page === 'product' ? 'home' : 'home')} />
          ) : (
            <Header query={query} setQuery={setQuery} onSearch={runSearch} area={deliveryArea} onChangeLocation={() => setShowLocationModal(true)} shopName={deliverySettings.shopName} products={products} nav={nav} categories={allRealCategories} deliverySettings={deliverySettings} theme={theme} setTheme={setTheme} lang={lang} setLang={setLangState} />
          )
        )}

        <div className="flex-1">
          {route.page === 'home' && <HomePage products={products} nav={nav} onAdd={addToCart} cart={cart} area={deliveryArea} categories={allCategories} deliverySettings={deliverySettings} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
          {route.page === 'categories' && <CategoriesPage nav={nav} categories={allRealCategories} />}
          {route.page === 'category' && <ProductListPage products={categoryProducts} nav={nav} onAdd={addToCart} cart={cart} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
          {route.page === 'list' && <ProductListPage products={listProducts} nav={nav} onAdd={addToCart} cart={cart} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
          {route.page === 'product' && <ProductPage product={currentProduct} nav={nav} onAdd={addToCart} onBuyNow={buyNow} qty={currentProduct ? (cart[currentProduct.id] || 0) : 0} />}
          {route.page === 'cart' && <CartPage cartItems={cartItems} updateQty={updateQty} removeItem={removeItem} subtotal={subtotal} nav={nav} products={products} onAdd={addToCart} cart={cart} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
          {route.page === 'checkout' && (
            cartItems.length
              ? <CheckoutPage cartItems={cartItems} subtotal={subtotal} deliverySettings={deliverySettings} nav={nav} placeOrder={placeOrder} />
              : <div className="p-8 text-center" style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 13 }}>Your cart is empty.</div>
          )}
          {route.page === 'about' && <AboutPage deliverySettings={deliverySettings} nav={nav} />}
          {route.page === 'profile' && <ProfilePage />}
          {route.page === 'my-orders' && <MyOrdersPage deliverySettings={deliverySettings} />}
          {route.page === 'game' && <GamePage />}
          {route.page === 'faq' && <FAQPage deliverySettings={deliverySettings} />}
          {route.page === 'terms' && <TermsPage deliverySettings={deliverySettings} />}
          {route.page === 'privacy' && <PrivacyPage deliverySettings={deliverySettings} />}
          {route.page === 'wishlist' && <WishlistPage products={products} wishlist={wishlist} nav={nav} onAdd={addToCart} cart={cart} onToggleWishlist={toggleWishlist} />}
          {route.page === 'admin' && !isAdmin && <AdminLogin onLogin={(refreshToken, email) => { if (refreshToken) { adminRefreshRef.current = refreshToken; setAdminEmail(email || ''); } setIsAdmin(true); }} adminPassword={adminPassword} />}
          {route.page === 'admin' && isAdmin && (
            <AdminPage
              products={products} setProducts={setProducts}
              salesLog={salesLog} refreshSalesLog={refreshSalesLog} onViewInvoice={setViewInvoice}
              deliverySettings={deliverySettings} setDeliverySettings={setDeliverySettings}
              onLogout={() => {
                setIsAdmin(false);
                setAdminEmail('');
                adminRefreshRef.current = null;
                setAuthToken(null);
                if (BACKEND_ENABLED) window.storage.delete('mm-admin-refresh').catch(() => {});
                nav('home');
              }}
              adminPassword={adminPassword} setAdminPassword={setAdminPassword}
              allRealCategories={allRealCategories} customCategories={customCategories} setCustomCategories={setCustomCategories}
              adminEmail={adminEmail}
            />
          )}
        </div>

        <BottomNav page={route.page} nav={nav} cartCount={cartCount} />
      </div>
    </div>
    {viewInvoice && <InvoiceOverlay order={viewInvoice} deliverySettings={deliverySettings} onClose={() => setViewInvoice(null)} />}
    <style>{`@media print { .app-shell { display: none !important; } }`}</style>
    </>
  );
}
