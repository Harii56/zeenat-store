// Product catalog for the boutique store.
// Each product: id, name, gender (men/women/kids), category, price (PKR),
// image (placeholder photo, consistent per id), description, sizes, stock.
//
// AFFILIATE PRODUCTS: add an optional `affiliateLink: "https://..."` field
// to any product. When present, its product page shows a direct "Buy Now"
// button that opens that link in a new tab (bypassing our own cart/checkout),
// and its listing card shows a small "Partner" badge.

const img = (seed) => `https://picsum.photos/seed/${seed}/600/750`;

const products = [
  // Add your real products here manually if needed, or use the /admin panel
  // (recommended) — anything added there shows up automatically alongside
  // whatever is listed in this array.
];

// Attach multiple gallery images + a deterministic rating/review count
// to every product, without hand-editing each entry above.
products.forEach((p) => {
  p.images = [p.image, img(p.id + "-b"), img(p.id + "-c")];

  let hash = 0;
  for (let i = 0; i < p.id.length; i++) hash = (hash * 31 + p.id.charCodeAt(i)) % 1000;
  p.rating = (4 + (hash % 10) / 10).toFixed(1); // 4.0 - 4.9
  p.reviewCount = 8 + (hash % 45); // 8 - 52
});

// ---- Admin-added products (read fresh from disk each time so the
// admin panel can add products without needing a server restart) ----
const fs = require("fs");
const path = require("path");
const ADMIN_PRODUCTS_FILE = path.join(__dirname, "admin-products.json");

if (!fs.existsSync(ADMIN_PRODUCTS_FILE)) {
  fs.writeFileSync(ADMIN_PRODUCTS_FILE, "[]");
}

function readAdminProducts() {
  try {
    const raw = fs.readFileSync(ADMIN_PRODUCTS_FILE, "utf-8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeAdminProducts(list) {
  fs.writeFileSync(ADMIN_PRODUCTS_FILE, JSON.stringify(list, null, 2));
}

function allProducts() {
  return [...products, ...readAdminProducts()];
}

function isExpired(p) {
  if (!p.saleEndDate) return false;
  const end = new Date(p.saleEndDate + "T23:59:59");
  return Date.now() > end.getTime();
}

// Only non-expired products are shown to customers browsing the shop.
function activeProducts() {
  return allProducts().filter((p) => !isExpired(p));
}

function getAll() {
  return activeProducts();
}

function getById(id) {
  // Not filtered by expiry: direct links, cart, and order history should
  // still resolve even if a deal has since ended.
  return allProducts().find((p) => p.id === id);
}

function filter({ gender, category, search } = {}) {
  return activeProducts().filter((p) => {
    if (gender && p.gender !== gender) return false;
    if (category && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

const CATEGORIES = ["dresses", "shirts", "jackets", "pants", "bags", "jewelry", "bands", "glasses"];
const GENDERS = ["women", "men", "kids"];

function categoriesForGender(gender) {
  const set = new Set(
    activeProducts().filter((p) => p.gender === gender).map((p) => p.category)
  );
  return CATEGORIES.filter((c) => set.has(c));
}

module.exports = {
  getAll,
  getById,
  filter,
  categoriesForGender,
  isExpired,
  CATEGORIES,
  GENDERS,
  readAdminProducts,
  writeAdminProducts,
};
