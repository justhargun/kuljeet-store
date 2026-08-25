import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, MapPin, ShoppingCart, Home, LayoutGrid, Package, Star, Plus, Minus,
  Check, ChevronRight, ChevronDown, X, Sparkles, Droplet, Droplets,
  Wind, Heart, Palette, Baby, Sun, Tag, Lock, Truck, CreditCard, Banknote,
  MessageCircle, Trash2, PlusCircle, BarChart3, Users,
  ClipboardList, AlertCircle, CheckCircle2, ArrowLeft,
  LogOut, Flower, ShoppingBasket, Smartphone, ImagePlus, KeyRound
} from 'lucide-react';

/* ---------------------------------- THEME ---------------------------------- */
const COLORS = {
  bg: '#FBF6EC',
  card: '#FFFFFF',
  ink: '#2B2013',
  inkSoft: '#8A7B65',
  border: '#ECE0C8',
  primary: '#D9730D',
  primaryDark: '#B45A05',
  secondary: '#0E6E5C',
  rose: '#B23A5C',
  gold: '#C89116',
  danger: '#C1443A',
  cream: '#FFF9EE',
  purple: '#6B4A9E',
  blue: '#3E7FB0',
};
const displayFont = "'Fraunces', Georgia, serif";
const bodyFont = "'Manrope', system-ui, sans-serif";
const monoFont = "'Space Mono', monospace";

/* ------------------------------ BACKEND (Supabase) ------------------------------
   Fill these in once you've created a Supabase project and run schema.sql there.
   Project Settings → API → Project URL / anon public key. The anon key is safe
   to ship in client code — it only grants what your Row Level Security policies
   allow (see schema.sql). Until these are filled in, the app automatically keeps
   working exactly as before, using this browser's local storage as a stand-in.
--------------------------------------------------------------------------------- */
const SUPABASE_URL = '';       // e.g. 'https://xxxxxxxx.supabase.co'
const SUPABASE_ANON_KEY = '';  // e.g. 'eyJhbGciOi...'
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

async function sbSelect(table, qs = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase select on ${table} failed (${res.status})`);
  return res.json();
}
async function sbInsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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
      apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
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
  if ('name' in patch) out.name = patch.name;
  if ('category' in patch) out.category = patch.category;
  if ('emoji' in patch) out.emoji = patch.emoji;
  if ('desc' in patch) out.description = patch.desc;
  if ('imageUrl' in patch) out.image_url = patch.imageUrl;
  return out;
}
function mapProductFromDb(r) {
  return {
    id: r.id, category: r.category, name: r.name, price: Number(r.price), mrp: Number(r.mrp), stock: r.stock,
    emoji: r.emoji || '\ud83d\udecd\ufe0f', g1: r.g1 || '#F7D9C4', g2: r.g2 || '#F0B499', rating: Number(r.rating) || 4,
    bestSeller: !!r.best_seller, isNew: !!r.is_new, deal: !!r.deal, desc: r.description || '', imageUrl: r.image_url || '',
  };
}
function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function mapDeliveryFromDb(row, pinRows) {
  return {
    shopName: row.shop_name, shopArea: row.shop_area, shopPincode: row.shop_pincode, mode: row.mode,
    radiusKm: Number(row.radius_km), minOrderValue: Number(row.min_order_value), deliveryCharge: Number(row.delivery_charge),
    freeDeliveryThreshold: Number(row.free_delivery_threshold), whatsappNumber: row.whatsapp_number,
    upiId: row.upi_id || '',
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

/* -------------------------------- PRODUCTS ---------------------------------- */
const RAW_PRODUCTS = [
  ['cosmetics', 'Rosewater Face Mist 120ml', 199, 249, 42, '\ud83c\udf39', 4.4, { bestSeller: true }],
  ['cosmetics', 'Charcoal Peel-Off Mask 90g', 249, 299, 30, '\ud83e\uddf4', 4.2, { deal: true }],
  ['skincare', 'Aloe Vera Soothing Gel 150ml', 149, 179, 60, '\ud83c\udf3f', 4.5, { bestSeller: true }],
  ['skincare', 'Vitamin C Brightening Serum 30ml', 399, 599, 18, '\u2728', 4.6, { deal: true, isNew: true }],
  ['skincare', 'Daily Sunscreen SPF50 50ml', 329, 399, 25, '\u2600\ufe0f', 4.5, { bestSeller: true }],
  ['haircare', 'Argan Hair Oil 200ml', 259, 320, 34, '\ud83e\udee4', 4.3, {}],
  ['haircare', 'Onion Hair Shampoo 340ml', 289, 349, 50, '\ud83e\uddb4', 4.4, { bestSeller: true, isNew: true }],
  ['haircare', 'Herbal Hair Mask 200g', 219, 260, 20, '\ud83d\udc41\ufe0f', 4.1, {}],
  ['personalcare', 'Herbal Handwash 250ml (Pack of 2)', 159, 199, 45, '\ud83e\uddfc', 4.3, {}],
  ['personalcare', 'Deo Roll-On for Men 50ml', 149, 179, 38, '\ud83d\udca8', 4.0, {}],
  ['perfumes', 'Oudh Attar Perfume 20ml', 349, 499, 15, '\ud83c\udf38', 4.6, { deal: true }],
  ['perfumes', 'Citrus Splash EDT 100ml', 599, 799, 12, '\ud83c\udf4b', 4.2, {}],
  ['makeup', 'Matte Liquid Lipstick', 249, 349, 40, '\ud83d\udc84', 4.5, { bestSeller: true }],
  ['makeup', 'Compact Powder Duo', 199, 249, 28, '\ud83c\udfa8', 4.1, { deal: true }],
  ['makeup', 'Kajal Twin Pack', 99, 129, 55, '\ud83d\udc41\ufe0f', 4.3, {}],
  ['bath', 'Sandalwood Bathing Bar (Pack of 4)', 149, 179, 70, '\ud83e\uddfd', 4.4, { isNew: true }],
  ['bath', 'Body Wash Lavender 300ml', 219, 259, 33, '\ud83d\udebf', 4.2, {}],
  ['baby', 'Baby Massage Oil 200ml', 189, 229, 24, '\ud83c\udf7c', 4.5, {}],
  ['baby', 'Baby Wet Wipes (80 pcs)', 129, 149, 65, '\ud83d\udc76', 4.6, { bestSeller: true }],
  ['household', 'Multi-Surface Cleaner 500ml', 129, 159, 40, '\ud83e\uddf9', 4.1, {}],
  ['household', 'Dishwash Bar (Pack of 3)', 45, 55, 90, '\ud83c\udf7d\ufe0f', 4.0, {}],
  ['general', 'Steel Lunch Box 3-Compartment', 349, 449, 16, '\ud83c\udf71', 4.3, {}],
  ['general', 'Cotton Bath Towel', 299, 399, 20, '\ud83e\uddfa', 4.2, {}],
  ['essentials', 'Refined Sunflower Oil 1L', 149, 169, 48, '\ud83e\uded9', 4.2, { bestSeller: true }],
  ['essentials', 'Basmati Rice 1kg', 129, 149, 55, '\ud83c\udf5a', 4.4, {}],
  ['essentials', 'Toor Dal 1kg', 139, 159, 44, '\ud83c\udf3e', 4.3, {}],
];
const SEED_PRODUCTS = RAW_PRODUCTS.map((r, i) => {
  const [category, name, price, mrp, stock, emoji, rating, flags] = r;
  const [g1, g2] = grad(i);
  return {
    id: 'p' + (i + 1), category, name, price, mrp, stock, emoji, rating, g1, g2,
    bestSeller: !!flags.bestSeller, isNew: !!flags.isNew, deal: !!flags.deal,
    desc: 'A trusted everyday pick from our store shelves, sourced fresh and stocked for quick home delivery in your neighbourhood.',
  };
});

/* ---------------------------------- DELIVERY -------------------------------- */
const SEED_DELIVERY = {
  shopName: 'Kuljeet Store',
  shopArea: 'Hargaon, Sitapur',
  shopPincode: '261121',
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

const STATUS_STEPS = ['Order Received', 'Confirmed', 'Packing', 'Out for Delivery', 'Delivered'];

/* -------------------------------- SMALL PARTS -------------------------------- */
function PriceTag({ price, mrp, size = 'md' }) {
  const off = pctOff(price, mrp);
  const big = size === 'lg';
  return (
    <div
      className="inline-flex flex-col items-start rounded"
      style={{ background: COLORS.ink, color: COLORS.cream, fontFamily: monoFont, padding: big ? '8px 12px' : '5px 9px', transform: 'rotate(-2deg)' }}
    >
      <span style={{ fontWeight: 700, fontSize: big ? 22 : 15, lineHeight: 1 }}>{money(price)}</span>
      {off > 0 && (
        <span style={{ fontSize: big ? 12 : 10, color: '#E8C878', marginTop: 3 }}>
          MRP {money(mrp)} &middot; {off}% off
        </span>
      )}
    </div>
  );
}

function StatusStepper({ status, compact }) {
  const idx = Math.max(0, STATUS_STEPS.indexOf(status));
  return (
    <div className="flex items-start w-full">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex-1 flex flex-col items-center relative">
          {i > 0 && (
            <div className="absolute" style={{ top: compact ? 9 : 13, right: '50%', width: '100%', height: 2, background: i <= idx ? COLORS.secondary : COLORS.border, zIndex: 0 }} />
          )}
          <div
            className="rounded-full flex items-center justify-center relative"
            style={{ width: compact ? 18 : 26, height: compact ? 18 : 26, background: i <= idx ? COLORS.secondary : '#fff', border: `2px solid ${i <= idx ? COLORS.secondary : COLORS.border}`, zIndex: 1 }}
          >
            {i < idx || (i === idx && status === 'Delivered') ? (
              <Check size={compact ? 11 : 14} color="#fff" />
            ) : i === idx ? (
              <div className="rounded-full" style={{ width: 7, height: 7, background: '#fff' }} />
            ) : null}
          </div>
          {!compact && (
            <span className="text-center mt-2" style={{ fontSize: 10, color: i <= idx ? COLORS.ink : COLORS.inkSoft, fontFamily: bodyFont, fontWeight: i === idx ? 700 : 500 }}>
              {s}
            </span>
          )}
        </div>
      ))}
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

function ProductCard({ product, onOpen, onAdd, qty }) {
  const off = pctOff(product.price, product.mrp);
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, minWidth: 158, width: 158 }}
      onClick={() => onOpen(product)}
    >
      <div className="relative flex items-center justify-center" style={{ height: 110, background: product.imageUrl ? '#fff' : `linear-gradient(135deg, ${product.g1}, ${product.g2})` }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full" style={{ objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 38 }}>{product.emoji}</span>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {product.isNew && <Badge bg={COLORS.secondary}>NEW</Badge>}
        </div>
        {off > 0 && (
          <div className="absolute top-2 right-2">
            <Badge bg={COLORS.danger}>{off}% OFF</Badge>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(43,32,19,0.55)' }}>
            <span className="text-xs font-semibold text-white">Out of stock</span>
          </div>
        )}
      </div>
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <p style={{ ...clamp2, color: COLORS.ink, fontFamily: bodyFont, fontWeight: 600, fontSize: 12.5, minHeight: 32 }}>{product.name}</p>
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
            style={{ width: 30, height: 30, background: product.stock === 0 ? COLORS.border : COLORS.primary, color: '#fff', flexShrink: 0 }}
          >
            <Plus size={15} />
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

function Rail({ products, onOpen, onAdd, cart }) {
  if (!products.length) return <p className="px-4 text-sm" style={{ color: COLORS.inkSoft, fontFamily: bodyFont }}>Nothing here yet.</p>;
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={onOpen} onAdd={onAdd} qty={cart[p.id] || 0} />
      ))}
    </div>
  );
}

/* --------------------------------- HEADER / NAV --------------------------------- */
function Header({ query = '', setQuery, onSearch, area, onChangeLocation, onBack, title, shopName, products = [], nav, categories = [] }) {
  const [focused, setFocused] = useState(false);

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
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3" style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <button onClick={onBack}><ArrowLeft size={20} color={COLORS.ink} /></button>
        <h1 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 17, color: COLORS.ink }}>{title}</h1>
      </div>
    );
  }
  return (
    <div className="sticky top-0 z-20" style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: COLORS.primary }}>
            <span style={{ fontSize: 18 }}>&#127978;</span>
          </div>
          <div>
            <h1 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 18, color: COLORS.ink, lineHeight: 1 }}>{shopName}</h1>
            <p style={{ fontFamily: bodyFont, fontSize: 10, color: COLORS.inkSoft }}>your neighbourhood, delivered</p>
          </div>
        </div>
        <button onClick={onChangeLocation} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ background: COLORS.cream, border: `1px solid ${COLORS.border}` }}>
          <MapPin size={13} color={COLORS.secondary} />
          <span style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 700, color: COLORS.ink, maxWidth: 78, ...clamp1 }}>{area || 'Set location'}</span>
          <ChevronDown size={12} color={COLORS.inkSoft} />
        </button>
      </div>
      <div className="px-4 py-3 relative">
        <form onSubmit={(e) => { e.preventDefault(); setFocused(false); onSearch(); }}>
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{
              background: '#fff', border: `1.5px solid ${focused ? COLORS.primary : COLORS.border}`,
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
              placeholder="Search products..."
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
            style={{ top: '100%', marginTop: -1, background: '#fff', border: `1.5px solid ${COLORS.primary}`, borderTop: 'none', borderRadius: '0 0 14px 14px', boxShadow: '0 10px 24px rgba(43,32,19,0.12)' }}
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
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full" style={{ objectFit: 'cover' }} /> : <span style={{ fontSize: 15 }}>{p.emoji}</span>}
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
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'categories', label: 'Categories', Icon: LayoutGrid },
    { id: 'cart', label: 'Cart', Icon: ShoppingCart, badge: cartCount },
    { id: 'admin', label: 'Admin', Icon: Lock },
  ];
  return (
    <div className="sticky bottom-0 z-30 flex items-stretch" style={{ background: '#fff', borderTop: `1px solid ${COLORS.border}` }}>
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
      <div className="w-full rounded-t-3xl p-5" style={{ background: '#fff', maxWidth: 448 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 18, color: COLORS.ink }}>Delivering to your door</h2>
          <button onClick={onClose}><X size={20} color={COLORS.inkSoft} /></button>
        </div>
        <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 14 }}>Enter your 6-digit pincode so we can confirm we deliver to your area.</p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter pincode e.g. 201301"
          className="w-full px-4 py-3 rounded-xl mb-3"
          style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 15, outline: 'none' }}
        />
        {result && result.allowed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3" style={{ background: '#EAF5F0' }}>
            <CheckCircle2 size={16} color={COLORS.secondary} />
            <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.secondary, fontWeight: 700 }}>We deliver here{result.area ? ' \u2014 ' + result.area : ''}!</span>
          </div>
        )}
        {result && !result.allowed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3" style={{ background: '#FBEAE8' }}>
            <AlertCircle size={16} color={COLORS.danger} />
            <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.danger, fontWeight: 700 }}>Sorry, we currently don&rsquo;t deliver to this location.</span>
          </div>
        )}
        <button
          onClick={() => onConfirm(pin, result)}
          disabled={!result || !result.allowed}
          className="w-full py-3.5 rounded-xl"
          style={{ background: result && result.allowed ? COLORS.primary : COLORS.border, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14 }}
        >
          Confirm location
        </button>
        <button onClick={onClose} className="w-full py-3 text-center" style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft }}>Skip for now, keep browsing</button>
      </div>
    </div>
  );
}

/* ----------------------------------- PAGES ----------------------------------- */
function HomePage({ products, nav, onAdd, cart, area, categories }) {
  const bestSellers = products.filter((p) => p.bestSeller);
  const newArrivals = products.filter((p) => p.isNew);
  const deals = products.filter((p) => p.deal);
  const recommended = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
  return (
    <div className="pb-6">
      <div className="mx-4 mt-1 mb-5 rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${COLORS.primary}, ${COLORS.rose})` }}>
        <p style={{ fontFamily: bodyFont, fontSize: 11, color: '#FBE3B0', fontWeight: 700, letterSpacing: 0.5 }}>THIS WEEK ONLY</p>
        <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontStyle: 'italic', fontSize: 24, color: '#fff', marginTop: 4, lineHeight: 1.15 }}>Flat 20% off<br />on Skincare &amp; Makeup</h2>
        <button onClick={() => nav('category', { id: 'offers' })} className="mt-4 px-4 py-2 rounded-full" style={{ background: '#fff', color: COLORS.primaryDark, fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>
          Shop Now
        </button>
        <span className="absolute" style={{ right: -10, bottom: -20, fontSize: 90, opacity: 0.25 }}>&#128132;</span>
      </div>

      <SectionHeader title="Shop by Category" />
      <div className="grid grid-cols-4 gap-3 px-4 mb-6">
        {categories.map((c) => (
          <button key={c.id} onClick={() => nav('category', { id: c.id })} className="flex flex-col items-center gap-1.5">
            <div className="rounded-2xl flex items-center justify-center" style={{ width: 56, height: 56, background: `${c.color}1A` }}>
              <c.Icon size={22} color={c.color} />
            </div>
            <span style={{ ...clamp2, textAlign: 'center', fontFamily: bodyFont, fontSize: 10, fontWeight: 600, color: COLORS.ink, lineHeight: 1.2 }}>{c.name}</span>
          </button>
        ))}
      </div>

      <SectionHeader title="Best Sellers" subtitle="Loved by your neighbours" onSeeAll={() => nav('list', { title: 'Best Sellers', filter: 'bestSeller' })} />
      <Rail products={bestSellers} onOpen={(p) => nav('product', { id: p.id })} onAdd={onAdd} cart={cart} />

      <div className="mt-6" />
      <SectionHeader title="New Arrivals" subtitle="Fresh on our shelves" onSeeAll={() => nav('category', { id: 'newarrivals' })} />
      <Rail products={newArrivals} onOpen={(p) => nav('product', { id: p.id })} onAdd={onAdd} cart={cart} />

      <div className="mt-6" />
      <SectionHeader title="Today's Deals" subtitle="Grab them before they're gone" onSeeAll={() => nav('category', { id: 'offers' })} />
      <Rail products={deals} onOpen={(p) => nav('product', { id: p.id })} onAdd={onAdd} cart={cart} />

      <div className="mt-6" />
      <SectionHeader title="Recommended for You" />
      <div className="grid grid-cols-2 gap-3 px-4">
        {recommended.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={(pr) => nav('product', { id: pr.id })} onAdd={onAdd} qty={cart[p.id] || 0} />
        ))}
      </div>
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

function ProductListPage({ products, title, nav, onAdd, cart }) {
  return (
    <div className="p-4">
      {!products.length ? (
        <div className="flex flex-col items-center py-16 gap-2">
          <Package size={36} color={COLORS.inkSoft} />
          <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 13 }}>No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={(pr) => nav('product', { id: pr.id })} onAdd={onAdd} qty={cart[p.id] || 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductPage({ product, nav, onAdd, onBuyNow, qty }) {
  const [n, setN] = useState(1);
  if (!product) return null;
  const off = pctOff(product.price, product.mrp);
  return (
    <div className="pb-32">
      <div className="flex items-center justify-center" style={{ height: 240, background: product.imageUrl ? '#fff' : `linear-gradient(135deg, ${product.g1}, ${product.g2})` }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full" style={{ objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 96 }}>{product.emoji}</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {product.isNew && <Badge bg={COLORS.secondary}>NEW</Badge>}
          {off > 0 && <Badge bg={COLORS.danger}>{off}% OFF</Badge>}
          {product.bestSeller && <Badge bg={COLORS.gold}>BESTSELLER</Badge>}
        </div>
        <h1 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 21, color: COLORS.ink }}>{product.name}</h1>
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={13} fill={COLORS.gold} color={COLORS.gold} />
          <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft }}>{product.rating} rating</span>
          <span style={{ color: COLORS.border }}>&bull;</span>
          <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: product.stock > 0 ? COLORS.secondary : COLORS.danger, fontWeight: 700 }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
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
          {qty > 0 && <span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.secondary, fontWeight: 700 }}>{qty} already in cart</span>}
        </div>
      </div>

      <div className="fixed left-0 right-0 flex justify-center z-40" style={{ bottom: 58 }}>
        <div className="w-full flex gap-3 p-3" style={{ background: '#fff', borderTop: `1px solid ${COLORS.border}`, maxWidth: 448, boxShadow: '0 -6px 18px rgba(43,32,19,0.10)' }}>
          <button
            onClick={() => onAdd(product, n)}
            disabled={product.stock === 0}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
            style={{ background: COLORS.cream, border: `2px solid ${COLORS.primary}`, color: COLORS.primaryDark, fontFamily: bodyFont, fontWeight: 700, fontSize: 13.5, opacity: product.stock === 0 ? 0.5 : 1 }}
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
          <button
            onClick={() => onBuyNow(product, n)}
            disabled={product.stock === 0}
            className="flex-1 py-3 rounded-xl"
            style={{ background: product.stock === 0 ? COLORS.border : COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 13.5, boxShadow: product.stock === 0 ? 'none' : '0 4px 10px rgba(217,115,13,0.35)' }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage({ cartItems, updateQty, removeItem, subtotal, nav }) {
  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 px-6">
        <ShoppingCart size={40} color={COLORS.inkSoft} />
        <p style={{ fontFamily: bodyFont, color: COLORS.ink, fontWeight: 700, fontSize: 14 }}>Your cart is empty</p>
        <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 12, textAlign: 'center' }}>Explore our categories and add items you love.</p>
        <button onClick={() => nav('categories')} className="px-5 py-2.5 rounded-full mt-1" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Browse Categories</button>
      </div>
    );
  }
  return (
    <div className="pb-32">
      <div className="p-4 flex flex-col gap-3">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3 p-3 rounded-2xl" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
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
                  <button onClick={() => updateQty(item.id, item.qty + 1)}><Plus size={12} /></button>
                </div>
                <button onClick={() => removeItem(item.id)}><Trash2 size={14} color={COLORS.danger} /></button>
              </div>
            </div>
            <span style={{ fontFamily: monoFont, fontSize: 12.5, fontWeight: 700, color: COLORS.ink }}>{money(item.price * item.qty)}</span>
          </div>
        ))}
      </div>
      <div className="fixed left-0 right-0 flex justify-center z-40" style={{ bottom: 58 }}>
        <div className="w-full p-4 rounded-t-2xl" style={{ background: '#fff', borderTop: `1px solid ${COLORS.border}`, maxWidth: 448, boxShadow: '0 -6px 18px rgba(43,32,19,0.10)' }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: bodyFont, fontSize: 13, color: COLORS.inkSoft }}>Subtotal</span>
            <span style={{ fontFamily: monoFont, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>{money(subtotal)}</span>
          </div>
          <button onClick={() => nav('checkout')} className="w-full py-3.5 rounded-xl" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14, boxShadow: '0 4px 10px rgba(217,115,13,0.35)' }}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ cartItems, subtotal, deliverySettings, nav, placeOrder }) {
  const [form, setForm] = useState({ name: '', mobile: '', address: '', pincode: '' });
  const [payment, setPayment] = useState('cod');
  const [zone, setZone] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (form.pincode.length === 6) setZone(checkDeliveryZone(form.pincode, deliverySettings));
    else setZone(null);
  }, [form.pincode]);

  const belowMin = subtotal < deliverySettings.minOrderValue;
  const deliveryCharge = subtotal >= deliverySettings.freeDeliveryThreshold ? 0 : deliverySettings.deliveryCharge;
  const total = subtotal + deliveryCharge;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setError('');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!/^\d{10}$/.test(form.mobile)) return setError('Please enter a valid 10-digit mobile number.');
    if (!form.address.trim()) return setError('Please enter your delivery address.');
    if (!zone || !zone.allowed) return setError("Sorry, we currently don't deliver to this location.");
    if (belowMin) return setError(`Minimum order value is ${money(deliverySettings.minOrderValue)}.`);

    if (payment === 'online' && RAZORPAY_ENABLED) {
      setPaying(true);
      const result = await payWithRazorpay({ amountRupees: total, shopName: deliverySettings.shopName, customerName: form.name, customerMobile: form.mobile });
      setPaying(false);
      if (!result.success) return setError(result.error || 'Payment could not be completed.');
      placeOrder({ ...form, payment, deliveryCharge, total, subtotal, area: zone.area, paymentId: result.paymentId });
      return;
    }
    if (payment === 'upi') {
      if (!deliverySettings.upiId) return setError('UPI isn\u2019t set up yet. Please choose another payment method.');
      const link = buildUpiLink({ upiId: deliverySettings.upiId, amountRupees: total, shopName: deliverySettings.shopName, orderNote: `Order for ${form.name}` });
      window.location.href = link;
      placeOrder({ ...form, payment, deliveryCharge, total, subtotal, area: zone.area });
      return;
    }
    placeOrder({ ...form, payment, deliveryCharge, total, subtotal, area: zone.area });
  };

  return (
    <div className="p-4 pb-32">
      <h2 style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 8 }}>Delivery Details</h2>
      <div className="flex flex-col gap-2.5">
        <input value={form.name} onChange={set('name')} placeholder="Customer name" className="px-4 py-3 rounded-xl" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none' }} />
        <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="Mobile number" className="px-4 py-3 rounded-xl" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 13, outline: 'none' }} />
        <textarea value={form.address} onChange={set('address')} placeholder="Delivery address (house no, street, landmark)" rows={3} className="px-4 py-3 rounded-xl" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none', resize: 'none' }} />
        <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="Pincode" className="px-4 py-3 rounded-xl" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 13, outline: 'none' }} />

        {zone && zone.allowed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#EAF5F0' }}>
            <CheckCircle2 size={15} color={COLORS.secondary} />
            <span style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.secondary, fontWeight: 700 }}>Great news, we deliver to {zone.area || 'your area'}!</span>
          </div>
        )}
        {zone && !zone.allowed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#FBEAE8' }}>
            <AlertCircle size={15} color={COLORS.danger} />
            <span style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.danger, fontWeight: 700 }}>Sorry, we currently don&rsquo;t deliver to this location.</span>
          </div>
        )}
      </div>

      <h2 style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink, margin: '18px 0 8px' }}>Payment Method</h2>
      <div className="flex flex-col gap-2">
        <button onClick={() => setPayment('cod')} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ border: `2px solid ${payment === 'cod' ? COLORS.primary : COLORS.border}` }}>
          <Banknote size={17} color={COLORS.ink} />
          <span style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: COLORS.ink }}>Cash on Delivery</span>
        </button>
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

      <div className="mt-5 rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
        <div className="flex justify-between mb-1.5"><span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft }}>Subtotal</span><span style={{ fontFamily: monoFont, fontSize: 12.5, color: COLORS.ink }}>{money(subtotal)}</span></div>
        <div className="flex justify-between mb-1.5"><span style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft }}>Delivery charge</span><span style={{ fontFamily: monoFont, fontSize: 12.5, color: deliveryCharge === 0 ? COLORS.secondary : COLORS.ink }}>{deliveryCharge === 0 ? 'FREE' : money(deliveryCharge)}</span></div>
        {belowMin && <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.danger, marginBottom: 6 }}>Minimum order value is {money(deliverySettings.minOrderValue)}. Add {money(deliverySettings.minOrderValue - subtotal)} more.</p>}
        {!belowMin && deliveryCharge > 0 && <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, marginBottom: 6 }}>Add {money(deliverySettings.freeDeliveryThreshold - subtotal)} more for free delivery.</p>}
        <div className="flex justify-between pt-2" style={{ borderTop: `1px dashed ${COLORS.border}` }}>
          <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13.5, color: COLORS.ink }}>Total Amount</span>
          <span style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 15, color: COLORS.ink }}>{money(total)}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl" style={{ background: '#FBEAE8' }}>
          <AlertCircle size={15} color={COLORS.danger} />
          <span style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.danger }}>{error}</span>
        </div>
      )}

      <div className="fixed left-0 right-0 flex justify-center z-40" style={{ bottom: 58 }}>
        <div className="w-full p-4" style={{ background: '#fff', borderTop: `1px solid ${COLORS.border}`, maxWidth: 448, boxShadow: '0 -6px 18px rgba(43,32,19,0.10)' }}>
          <button onClick={submit} disabled={paying} className="w-full py-3.5 rounded-xl" style={{ background: paying ? COLORS.border : COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14, boxShadow: paying ? 'none' : '0 4px 10px rgba(217,115,13,0.35)' }}>
            {paying ? 'Opening payment...' : payment === 'online' && RAZORPAY_ENABLED ? `Pay ${money(total)} Now` : payment === 'upi' ? `Pay ${money(total)} via UPI` : `Place Order \u00b7 ${money(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderSuccessPage({ order, nav, whatsappNumber }) {
  if (!order) return null;
  const msg = `New order ${order.id} from ${order.name} (${order.mobile}).\nAddress: ${order.address}, ${order.pincode} (${order.area || ''}).\nItems:\n${order.items.map((i) => `- ${i.name} x${i.qty} = ${money(i.price * i.qty)}`).join('\n')}\nDelivery: ${order.deliveryCharge === 0 ? 'FREE' : money(order.deliveryCharge)}\nTotal: ${money(order.total)}\nPayment: ${paymentLabel(order.payment)}${order.paymentId ? ' (' + order.paymentId + ')' : ''}`;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  return (
    <div className="p-5 flex flex-col items-center pb-10">
      <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 60, height: 60, background: '#EAF5F0' }}>
        <CheckCircle2 size={32} color={COLORS.secondary} />
      </div>
      <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 19, color: COLORS.ink }}>Order Placed!</h2>
      <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }}>Order ID: {order.id}</p>
      {order.paymentId && <p style={{ fontFamily: monoFont, fontSize: 10.5, color: COLORS.secondary, marginTop: 2 }}>Payment ref: {order.paymentId}</p>}

      <div className="w-full mt-6 rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
        <StatusStepper status={order.status} />
      </div>

      <div className="w-full mt-4 rounded-2xl p-4 flex flex-col gap-1.5" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between"><span style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.ink }}>{i.name} &times; {i.qty}</span><span style={{ fontFamily: monoFont, fontSize: 12, color: COLORS.ink }}>{money(i.price * i.qty)}</span></div>
        ))}
        <div className="flex justify-between pt-2 mt-1" style={{ borderTop: `1px dashed ${COLORS.border}` }}>
          <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13, color: COLORS.ink }}>Total</span>
          <span style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 13, color: COLORS.ink }}>{money(order.total)}</span>
        </div>
      </div>

      <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full mt-4 py-3.5 rounded-xl flex items-center justify-center gap-2" style={{ background: '#1EA556', color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 13.5 }}>
        <MessageCircle size={17} /> Notify Shop on WhatsApp
      </a>
      <button onClick={() => nav('myorders')} className="w-full mt-2.5 py-3 rounded-xl" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.ink, fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>Track My Orders</button>
      <button onClick={() => nav('home')} className="w-full mt-2.5 py-3" style={{ color: COLORS.inkSoft, fontFamily: bodyFont, fontSize: 12.5 }}>Continue Shopping</button>
    </div>
  );
}

function MyOrdersPage({ orders, lastMobile }) {
  const [mobile, setMobile] = useState(lastMobile || '');
  const [searched, setSearched] = useState(!!lastMobile);
  const list = orders.filter((o) => o.mobile === mobile).sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div className="p-4 pb-10">
      <div className="flex gap-2 mb-4">
        <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Enter your mobile number" className="flex-1 px-4 py-3 rounded-xl" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 13, outline: 'none' }} />
        <button onClick={() => setSearched(true)} className="px-4 rounded-xl" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Find</button>
      </div>
      {searched && !list.length && (
        <div className="flex flex-col items-center py-16 gap-2">
          <ClipboardList size={34} color={COLORS.inkSoft} />
          <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 12.5 }}>No orders found for this number.</p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{o.id}</span>
              <span style={{ fontFamily: monoFont, fontSize: 12, color: COLORS.primaryDark, fontWeight: 700 }}>{money(o.total)}</span>
            </div>
            <StatusStepper status={o.status} compact />
            <p style={{ ...clamp1, fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft, marginTop: 10 }}>{o.items.map((i) => i.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- ADMIN ---------------------------------- */
function AdminLogin({ onLogin, adminPassword }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className="flex flex-col items-center px-6 pt-20">
      <div className="rounded-full flex items-center justify-center mb-4" style={{ width: 56, height: 56, background: COLORS.cream }}>
        <Lock size={24} color={COLORS.primary} />
      </div>
      <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 19, color: COLORS.ink }}>Admin Dashboard</h2>
      <p style={{ fontFamily: bodyFont, fontSize: 12, color: COLORS.inkSoft, marginTop: 4, marginBottom: 20, textAlign: 'center' }}>Manage products, orders, delivery zones and more.</p>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter admin password" className="w-full px-4 py-3 rounded-xl mb-3" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 13, outline: 'none' }} />
      {err && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.danger, marginBottom: 8 }}>{err}</p>}
      <button
        onClick={() => (pw === adminPassword ? onLogin() : setErr('Incorrect password. Please try again.'))}
        className="w-full py-3.5 rounded-xl"
        style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14 }}
      >
        Login
      </button>
    </div>
  );
}

function AdminTabs({ tab, setTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', Icon: BarChart3 },
    { id: 'products', label: 'Products', Icon: Package },
    { id: 'orders', label: 'Orders', Icon: ClipboardList },
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

function AdminOverview({ products, orders }) {
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status !== 'Delivered').length;
  const kpis = [
    { label: 'Total Orders', value: orders.length, color: COLORS.primary },
    { label: 'Revenue', value: money(revenue), color: COLORS.secondary },
    { label: 'Pending Orders', value: pending, color: COLORS.rose },
    { label: 'Products Listed', value: products.length, color: COLORS.gold },
  ];
  const byStatus = STATUS_STEPS.map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length }));
  const maxCount = Math.max(1, ...byStatus.map((b) => b.count));
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3 mb-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
            <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, marginBottom: 6 }}>{k.label}</p>
            <p style={{ fontFamily: monoFont, fontSize: 19, fontWeight: 700, color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink, marginBottom: 12 }}>Orders by Status</p>
        <div className="flex items-end gap-3" style={{ height: 120 }}>
          {byStatus.map((b) => (
            <div key={b.status} className="flex-1 flex flex-col items-center gap-1.5 justify-end h-full">
              <span style={{ fontFamily: monoFont, fontSize: 11, color: COLORS.ink }}>{b.count}</span>
              <div className="w-full rounded-t-md" style={{ height: Math.max(6, (b.count / maxCount) * 80), background: COLORS.secondary }} />
              <span style={{ fontFamily: bodyFont, fontSize: 8.5, color: COLORS.inkSoft, textAlign: 'center' }}>{b.status}</span>
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
  const [catForm, setCatForm] = useState({ name: '', emoji: '\ud83c\udff7\ufe0f', color: '#D9730D' });
  const [form, setForm] = useState({ name: '', category: categories[0].id, price: '', mrp: '', stock: '', emoji: '\ud83d\udecd\ufe0f', desc: '', imageUrl: '' });

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
    setProducts(products.filter((p) => p.id !== id));
    if (BACKEND_ENABLED) sbDelete('products', `id=eq.${id}`).catch((e) => console.error('Product delete failed to sync:', e));
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
      category: form.category, name: form.name, price: Number(form.price), mrp: Number(form.mrp),
      stock: Number(form.stock) || 0, emoji: form.emoji || '\ud83d\udecd\ufe0f', rating: 4.0, g1, g2, bestSeller: false, isNew: true, deal: false,
      desc: form.desc || 'A trusted everyday pick from our store shelves.', imageUrl: form.imageUrl || '',
    };
    if (BACKEND_ENABLED) {
      try {
        const rows = await sbInsert('products', [{
          category: draft.category, name: draft.name, price: draft.price, mrp: draft.mrp, stock: draft.stock,
          emoji: draft.emoji, g1, g2, rating: draft.rating, best_seller: false, is_new: true, deal: false, description: draft.desc,
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
    setForm({ name: '', category: categories[0].id, price: '', mrp: '', stock: '', emoji: '\ud83d\udecd\ufe0f', desc: '', imageUrl: '' });
    setShowAdd(false);
  };

  return (
    <div className="p-4">
      <button onClick={() => setShowCats(!showCats)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-3" style={{ border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink }}>
        <Tag size={15} /> <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>{showCats ? 'Close Categories' : 'Manage Categories'}</span>
      </button>

      {showCats && (
        <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
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
            <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Category name" className="flex-1 px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
            <input value={catForm.emoji} onChange={(e) => setCatForm({ ...catForm, emoji: e.target.value })} placeholder="Icon" className="w-16 px-2 py-2.5 rounded-lg text-center" style={{ border: `1px solid ${COLORS.border}`, fontSize: 15, outline: 'none' }} />
            <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-11 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, padding: 2 }} />
          </div>
          <button onClick={addCategory} className="py-2.5 rounded-lg" style={{ background: COLORS.ink, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Add Category</button>
        </div>
      )}

      <button onClick={() => setShowAdd(!showAdd)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-4" style={{ background: COLORS.ink, color: '#fff' }}>
        <PlusCircle size={16} /> <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 13 }}>{showAdd ? 'Close Form' : 'Add Product'}</span>
      </button>

      {showAdd && (
        <div className="rounded-2xl p-4 mb-4 flex flex-col gap-2.5" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5 }}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, '') })} placeholder="Selling price" className="flex-1 px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
            <input value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value.replace(/\D/g, '') })} placeholder="MRP" className="flex-1 px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
          </div>
          <div className="flex gap-2">
            <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/\D/g, '') })} placeholder="Stock quantity" className="flex-1 px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12.5, outline: 'none' }} />
            <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="Icon (emoji)" className="w-24 px-3 py-2.5 rounded-lg text-center" style={{ border: `1px solid ${COLORS.border}`, fontSize: 15, outline: 'none' }} />
          </div>
          <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Description" rows={2} className="px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none', resize: 'none' }} />
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

      <div className="flex flex-col gap-3">
        {products.map((p) => {
          const off = pctOff(Number(p.price), Number(p.mrp));
          return (
            <div key={p.id} className="rounded-2xl p-3 flex gap-3" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="rounded-xl overflow-hidden flex items-center justify-center" style={{ width: 50, height: 50, background: p.imageUrl ? '#fff' : `linear-gradient(135deg, ${p.g1}, ${p.g2})`, border: `1px solid ${COLORS.border}` }}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full" style={{ objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>{p.emoji}</span>}
                </div>
                <label className="cursor-pointer" style={{ color: COLORS.primaryDark }}>
                  <ImagePlus size={13} />
                  <input type="file" accept="image/*" onChange={handleRowPhoto(p.id)} className="hidden" />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ ...clamp1, fontFamily: bodyFont, fontWeight: 700, fontSize: 12, color: COLORS.ink }}>{p.name}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <label className="flex items-center gap-1"><span style={{ fontSize: 10, color: COLORS.inkSoft, fontFamily: bodyFont }}>Price</span>
                    <input type="text" value={p.price} onChange={(e) => update(p.id, { price: Number(e.target.value.replace(/\D/g, '')) || 0 })} className="w-16 px-1.5 py-1 rounded" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 11 }} />
                  </label>
                  <label className="flex items-center gap-1"><span style={{ fontSize: 10, color: COLORS.inkSoft, fontFamily: bodyFont }}>MRP</span>
                    <input type="text" value={p.mrp} onChange={(e) => update(p.id, { mrp: Number(e.target.value.replace(/\D/g, '')) || 0 })} className="w-16 px-1.5 py-1 rounded" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 11 }} />
                  </label>
                  <label className="flex items-center gap-1"><span style={{ fontSize: 10, color: COLORS.inkSoft, fontFamily: bodyFont }}>Stock</span>
                    <input type="text" value={p.stock} onChange={(e) => update(p.id, { stock: Number(e.target.value.replace(/\D/g, '')) || 0 })} className="w-14 px-1.5 py-1 rounded" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 11 }} />
                  </label>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.bestSeller} onChange={(e) => update(p.id, { bestSeller: e.target.checked })} /><span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.inkSoft }}>Bestseller</span></label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.isNew} onChange={(e) => update(p.id, { isNew: e.target.checked })} /><span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.inkSoft }}>New</span></label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.deal} onChange={(e) => update(p.id, { deal: e.target.checked })} /><span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.inkSoft }}>Deal</span></label>
                  <span style={{ fontSize: 10, fontFamily: bodyFont, color: COLORS.gold, fontWeight: 700 }}>{off > 0 ? off + '% off' : ''}</span>
                </div>
              </div>
              <button onClick={() => remove(p.id)}><Trash2 size={16} color={COLORS.danger} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminOrders({ orders, setOrders, whatsappNumber }) {
  const update = (id, status) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    if (BACKEND_ENABLED) sbUpdate('orders', `id=eq.${id}`, { status }).catch((e) => console.error('Order status failed to sync:', e));
  };
  const sorted = [...orders].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div className="p-4">
      {!sorted.length && <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 12.5, textAlign: 'center', marginTop: 40 }}>No orders yet.</p>}
      <div className="flex flex-col gap-3">
        {sorted.map((o) => (
          <div key={o.id} className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>{o.id}</span>
                <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft }}>{o.name} &bull; {o.mobile}</p>
              </div>
              <a href={`https://wa.me/91${o.mobile}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} color="#1EA556" /></a>
            </div>
            <p style={{ fontFamily: bodyFont, fontSize: 11, color: COLORS.inkSoft, marginBottom: 6 }}>{o.address}, {o.pincode}</p>
            <p style={{ ...clamp1, fontFamily: bodyFont, fontSize: 11.5, color: COLORS.ink, marginBottom: 8 }}>{o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</p>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 700, color: COLORS.ink }}>{money(o.total)}</span>
              <Badge bg={o.payment === 'cod' ? COLORS.gold : o.payment === 'upi' ? COLORS.purple : COLORS.secondary}>{o.payment === 'cod' ? 'COD' : o.payment === 'upi' ? 'UPI' : 'ONLINE'}</Badge>
            </div>
            <select value={o.status} onChange={(e) => update(o.id, e.target.value)} className="w-full px-3 py-2 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12, fontWeight: 700, color: COLORS.ink }}>
              {STATUS_STEPS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDelivery({ settings, setSettings }) {
  const [local, setLocal] = useState(settings);
  const [newPin, setNewPin] = useState({ pincode: '', area: '' });
  const save = () => {
    setSettings(local);
    if (BACKEND_ENABLED) {
      sbUpdate('delivery_settings', 'id=eq.1', {
        shop_name: local.shopName, shop_area: local.shopArea, shop_pincode: local.shopPincode, mode: local.mode,
        radius_km: local.radiusKm, min_order_value: local.minOrderValue, delivery_charge: local.deliveryCharge,
        free_delivery_threshold: local.freeDeliveryThreshold, whatsapp_number: local.whatsappNumber, upi_id: local.upiId,
      }).catch((e) => console.error('Delivery settings failed to sync:', e));
      const prevPins = new Set(settings.pincodes.map((p) => p.pincode));
      const nextPins = new Set(local.pincodes.map((p) => p.pincode));
      const added = local.pincodes.filter((p) => !prevPins.has(p.pincode));
      const removed = settings.pincodes.filter((p) => !nextPins.has(p.pincode));
      if (added.length) sbInsert('delivery_pincodes', added).catch((e) => console.error('Pincode add failed to sync:', e));
      removed.forEach((p) => sbDelete('delivery_pincodes', `pincode=eq.${p.pincode}`).catch((e) => console.error('Pincode delete failed to sync:', e)));
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
      <input value={value} onChange={onChange} className="px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: mono ? monoFont : bodyFont, fontSize: 12.5, outline: 'none' }} />
    </label>
  );

  return (
    <div className="p-4 flex flex-col gap-4 pb-10">
      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Shop Details</p>
        {field('Shop name', local.shopName, (e) => setLocal({ ...local, shopName: e.target.value }))}
        {field('Shop area', local.shopArea, (e) => setLocal({ ...local, shopArea: e.target.value }))}
        {field('Shop pincode', local.shopPincode, (e) => setLocal({ ...local, shopPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }), true)}
        {field('WhatsApp number (with country code, no +)', local.whatsappNumber, (e) => setLocal({ ...local, whatsappNumber: e.target.value.replace(/\D/g, '') }), true)}
        {field('UPI ID (for UPI payment option, e.g. name@okaxis)', local.upiId, (e) => setLocal({ ...local, upiId: e.target.value.trim() }), true)}
      </div>

      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
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
              <input value={newPin.pincode} onChange={(e) => setNewPin({ ...newPin, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="Pincode" className="w-24 px-2 py-2 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: monoFont, fontSize: 12 }} />
              <input value={newPin.area} onChange={(e) => setNewPin({ ...newPin, area: e.target.value })} placeholder="Area name" className="flex-1 px-2 py-2 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12 }} />
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

      <div className="rounded-2xl p-4 grid grid-cols-1 gap-3" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Charges &amp; Order Rules</p>
        {field('Minimum order value (\u20b9)', local.minOrderValue, (e) => setLocal({ ...local, minOrderValue: Number(e.target.value.replace(/\D/g, '')) || 0 }), true)}
        {field('Delivery charge (\u20b9)', local.deliveryCharge, (e) => setLocal({ ...local, deliveryCharge: Number(e.target.value.replace(/\D/g, '')) || 0 }), true)}
        {field('Free delivery above (\u20b9)', local.freeDeliveryThreshold, (e) => setLocal({ ...local, freeDeliveryThreshold: Number(e.target.value.replace(/\D/g, '')) || 0 }), true)}
      </div>

      <button onClick={save} className="w-full py-3.5 rounded-xl" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 14 }}>Save Delivery Settings</button>
    </div>
  );
}

function AdminSecurity({ adminPassword, setAdminPassword }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState(null); // { type: 'error' | 'success', text }

  const submit = () => {
    if (currentPw !== adminPassword) return setMsg({ type: 'error', text: 'Current password is incorrect.' });
    if (newPw.length < 4) return setMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
    if (newPw !== confirmPw) return setMsg({ type: 'error', text: 'New password and confirmation don\u2019t match.' });
    setAdminPassword(newPw);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setMsg({ type: 'success', text: 'Password updated. Use it next time you log in.' });
  };

  return (
    <div className="p-4">
      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-2">
          <KeyRound size={16} color={COLORS.primary} />
          <p style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>Change Admin Password</p>
        </div>
        <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" className="px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" className="px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${COLORS.border}`, fontFamily: bodyFont, fontSize: 12.5, outline: 'none' }} />
        {msg && <p style={{ fontFamily: bodyFont, fontSize: 11.5, color: msg.type === 'error' ? COLORS.danger : COLORS.secondary }}>{msg.text}</p>}
        <button onClick={submit} className="py-2.5 rounded-lg" style={{ background: COLORS.primary, color: '#fff', fontFamily: bodyFont, fontWeight: 700, fontSize: 12.5 }}>Update Password</button>
        <p style={{ fontFamily: bodyFont, fontSize: 10.5, color: COLORS.inkSoft }}>This password is stored only in this browser, not shared across devices. For real multi-device admin login with proper security, the next upgrade is Supabase Auth (see SETUP.md).</p>
      </div>
    </div>
  );
}

function AdminCustomers({ orders }) {
  const map = {};
  orders.forEach((o) => {
    if (!map[o.mobile]) map[o.mobile] = { name: o.name, mobile: o.mobile, address: o.address, pincode: o.pincode, orders: 0, spent: 0 };
    map[o.mobile].orders += 1;
    map[o.mobile].spent += o.total;
    map[o.mobile].name = o.name;
    map[o.mobile].address = o.address;
  });
  const customers = Object.values(map).sort((a, b) => b.spent - a.spent);
  return (
    <div className="p-4">
      {!customers.length && <p style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 12.5, textAlign: 'center', marginTop: 40 }}>No customers yet.</p>}
      <div className="flex flex-col gap-3">
        {customers.map((c) => (
          <div key={c.mobile} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#fff', border: `1px solid ${COLORS.border}` }}>
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

function AdminPage({ products, setProducts, orders, setOrders, deliverySettings, setDeliverySettings, onLogout, adminPassword, setAdminPassword, allRealCategories, customCategories, setCustomCategories }) {
  const [tab, setTab] = useState('overview');
  return (
    <div className="pb-6">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <h1 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 17, color: COLORS.ink }}>Admin Dashboard</h1>
        <button onClick={onLogout} className="flex items-center gap-1"><LogOut size={15} color={COLORS.inkSoft} /><span style={{ fontFamily: bodyFont, fontSize: 11.5, color: COLORS.inkSoft }}>Logout</span></button>
      </div>
      <AdminTabs tab={tab} setTab={setTab} />
      {tab === 'overview' && <AdminOverview products={products} orders={orders} />}
      {tab === 'products' && <AdminProducts products={products} setProducts={setProducts} categories={allRealCategories} customCategories={customCategories} setCustomCategories={setCustomCategories} />}
      {tab === 'orders' && <AdminOrders orders={orders} setOrders={setOrders} whatsappNumber={deliverySettings.whatsappNumber} />}
      {tab === 'delivery' && <AdminDelivery settings={deliverySettings} setSettings={setDeliverySettings} />}
      {tab === 'customers' && <AdminCustomers orders={orders} />}
      {tab === 'security' && <AdminSecurity adminPassword={adminPassword} setAdminPassword={setAdminPassword} />}
    </div>
  );
}

/* ------------------------------------ APP ------------------------------------ */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [deliverySettings, setDeliverySettings] = useState(SEED_DELIVERY);
  const [cart, setCart] = useState({});
  const [route, setRoute] = useState({ page: 'home', params: {} });
  const [query, setQuery] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [customCategories, setCustomCategories] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [lastMobile, setLastMobile] = useState('');

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
        ]);
        const [c, loc, pw, cc] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));
        if (c && c.value) setCart(JSON.parse(c.value));
        if (loc && loc.value) { setDeliveryArea(loc.value); setShowLocationModal(false); }
        if (pw && pw.value) setAdminPassword(pw.value);
        if (cc && cc.value) setCustomCategories(JSON.parse(cc.value));
      } catch (e) { /* keep defaults */ }

      if (BACKEND_ENABLED) {
        try {
          const [prodRows, settingsRows, pinRows] = await Promise.all([
            sbSelect('products', '?select=*'),
            sbSelect('delivery_settings', '?select=*&id=eq.1'),
            sbSelect('delivery_pincodes', '?select=*'),
          ]);
          if (prodRows && prodRows.length) setProducts(prodRows.map(mapProductFromDb));
          if (settingsRows && settingsRows[0]) setDeliverySettings(mapDeliveryFromDb(settingsRows[0], pinRows || []));
        } catch (e) {
          console.error('Supabase load failed, showing local demo data instead:', e);
        }
        setLoaded(true);
        return;
      }
      try {
        const results = await Promise.allSettled([
          window.storage.get('mm-products'),
          window.storage.get('mm-orders'),
          window.storage.get('mm-delivery'),
        ]);
        const [p, o, d] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));
        if (p && p.value) setProducts(JSON.parse(p.value));
        if (o && o.value) setOrders(JSON.parse(o.value));
        if (d && d.value) setDeliverySettings({ ...SEED_DELIVERY, ...JSON.parse(d.value) });
      } catch (e) { /* fall back to seed data */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded && !BACKEND_ENABLED) window.storage.set('mm-products', JSON.stringify(products)).catch(() => {}); }, [products, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-orders', JSON.stringify(orders)).catch(() => {}); }, [orders, loaded]);
  useEffect(() => { if (loaded && !BACKEND_ENABLED) window.storage.set('mm-delivery', JSON.stringify(deliverySettings)).catch(() => {}); }, [deliverySettings, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-cart', JSON.stringify(cart)).catch(() => {}); }, [cart, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-admin-pw', adminPassword).catch(() => {}); }, [adminPassword, loaded]);
  useEffect(() => { if (loaded) window.storage.set('mm-custom-categories', JSON.stringify(customCategories)).catch(() => {}); }, [customCategories, loaded]);

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
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + n }));
  };
  const updateQty = (id, qty) => {
    if (qty <= 0) { const c = { ...cart }; delete c[id]; setCart(c); return; }
    setCart((c) => ({ ...c, [id]: qty }));
  };
  const removeItem = (id) => { const c = { ...cart }; delete c[id]; setCart(c); };

  const cartItems = useMemo(() => Object.entries(cart).map(([id, qty]) => {
    const p = products.find((p) => p.id === id);
    return p ? { ...p, qty } : null;
  }).filter(Boolean), [cart, products]);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const buyNow = (product, n) => { addToCart(product, n); nav('checkout'); };

  const placeOrder = (data) => {
    const order = {
      id: 'ORD' + String(Date.now()).slice(-6),
      name: data.name, mobile: data.mobile, address: data.address, pincode: data.pincode, area: data.area,
      items: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      subtotal: data.subtotal, deliveryCharge: data.deliveryCharge, total: data.total, payment: data.payment,
      paymentId: data.paymentId || null, status: 'Order Received', createdAt: Date.now(),
    };
    setOrders((o) => [...o, order]);
    setCart({});
    setLastOrder(order);
    setLastMobile(data.mobile);
    if (BACKEND_ENABLED) {
      sbInsert('orders', [{
        id: order.id, customer_name: order.name, mobile: order.mobile, address: order.address, pincode: order.pincode,
        area: order.area, subtotal: order.subtotal, delivery_charge: order.deliveryCharge, total: order.total,
        payment: order.payment, status: order.status, payment_ref: order.paymentId,
      }])
        .then(() => sbInsert('order_items', order.items.map((i) => ({ order_id: order.id, product_id: i.id, name: i.name, price: i.price, qty: i.qty }))))
        .catch((e) => console.error('Order saved locally, but syncing to Supabase failed:', e));
    }
    nav('ordersuccess');
  };

  const filteredForSearch = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || allCategories.find((c) => c.id === p.category)?.name.toLowerCase().includes(q));
  }, [query, products, allCategories]);

  const runSearch = () => { if (query.trim()) nav('list', { title: `Results for "${query}"`, filter: 'search' }); };

  let categoryProducts = [];
  if (route.page === 'category') {
    const cat = allCategories.find((c) => c.id === route.params.id);
    if (cat?.virtual === 'isNew') categoryProducts = products.filter((p) => p.isNew);
    else if (cat?.virtual === 'deal') categoryProducts = products.filter((p) => p.deal || p.mrp > p.price);
    else categoryProducts = products.filter((p) => p.category === route.params.id);
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
  const showBackHeader = route.page === 'category' || route.page === 'product' || route.page === 'checkout' || route.page === 'list';

  const headerTitleMap = {
    category: allCategories.find((c) => c.id === route.params.id)?.name,
    product: currentProduct?.name,
    checkout: 'Checkout',
    list: listTitle,
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <p style={{ fontFamily: displayFont, fontStyle: 'italic', fontSize: 18, color: COLORS.primary }}>Loading Kuljeet Store&hellip;</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: COLORS.bg, fontFamily: bodyFont }}>
      <div className="w-full flex flex-col" style={{ maxWidth: 448, minHeight: '100vh', background: COLORS.bg, boxShadow: '0 0 40px rgba(0,0,0,0.06)' }}>
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
            <Header query={query} setQuery={setQuery} onSearch={runSearch} area={deliveryArea} onChangeLocation={() => setShowLocationModal(true)} shopName={deliverySettings.shopName} products={products} nav={nav} categories={allRealCategories} />
          )
        )}

        <div className="flex-1">
          {route.page === 'home' && <HomePage products={products} nav={nav} onAdd={addToCart} cart={cart} area={deliveryArea} categories={allCategories} />}
          {route.page === 'categories' && <CategoriesPage nav={nav} categories={allRealCategories} />}
          {route.page === 'category' && <ProductListPage products={categoryProducts} nav={nav} onAdd={addToCart} cart={cart} />}
          {route.page === 'list' && <ProductListPage products={listProducts} nav={nav} onAdd={addToCart} cart={cart} />}
          {route.page === 'product' && <ProductPage product={currentProduct} nav={nav} onAdd={addToCart} onBuyNow={buyNow} qty={currentProduct ? (cart[currentProduct.id] || 0) : 0} />}
          {route.page === 'cart' && <CartPage cartItems={cartItems} updateQty={updateQty} removeItem={removeItem} subtotal={subtotal} nav={nav} />}
          {route.page === 'checkout' && (
            cartItems.length
              ? <CheckoutPage cartItems={cartItems} subtotal={subtotal} deliverySettings={deliverySettings} nav={nav} placeOrder={placeOrder} />
              : <div className="p-8 text-center" style={{ fontFamily: bodyFont, color: COLORS.inkSoft, fontSize: 13 }}>Your cart is empty.</div>
          )}
          {route.page === 'ordersuccess' && <OrderSuccessPage order={lastOrder} nav={nav} whatsappNumber={deliverySettings.whatsappNumber} />}
          {route.page === 'myorders' && <MyOrdersPage orders={orders} lastMobile={lastMobile} />}
          {route.page === 'admin' && !isAdmin && <AdminLogin onLogin={() => setIsAdmin(true)} adminPassword={adminPassword} />}
          {route.page === 'admin' && isAdmin && (
            <AdminPage
              products={products} setProducts={setProducts}
              orders={orders} setOrders={setOrders}
              deliverySettings={deliverySettings} setDeliverySettings={setDeliverySettings}
              onLogout={() => { setIsAdmin(false); nav('home'); }}
              adminPassword={adminPassword} setAdminPassword={setAdminPassword}
              allRealCategories={allRealCategories} customCategories={customCategories} setCustomCategories={setCustomCategories}
            />
          )}
        </div>

        <BottomNav page={route.page} nav={nav} cartCount={cartCount} />
      </div>
    </div>
  );
}
