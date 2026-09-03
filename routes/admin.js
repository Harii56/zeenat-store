const express = require("express");
const router = express.Router();
const { randomUUID } = require("crypto");
const products = require("../data/products");

// Simple admin password - change this to something only you know.
const ADMIN_PASSWORD = "zeenat2026";

function requireAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  res.redirect("/admin/login");
}

// ---------- Login ----------
router.get("/admin/login", (req, res) => {
  res.render("admin-login", { title: "Admin Login | Zeenat", error: null });
});

router.post("/admin/login", (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }
  res.render("admin-login", { title: "Admin Login | Zeenat", error: "Wrong password." });
});

router.get("/admin/logout", (req, res) => {
  req.session.isAdmin = false;
  res.redirect("/admin/login");
});

// ---------- Dashboard: add + list products ----------
router.get("/admin", requireAdmin, (req, res) => {
  const adminProducts = products.readAdminProducts();
  res.render("admin", {
    title: "Admin | Zeenat",
    adminProducts: adminProducts.slice().reverse(), // newest first
    categories: products.CATEGORIES,
    genders: products.GENDERS,
    isExpired: products.isExpired,
    error: null,
  });
});

router.post("/admin/products/add", requireAdmin, (req, res) => {
  const { name, price, currency, gender, category, description, sizes, colors, stock, images, affiliateLink, saleEndDate } = req.body;

  const imageList = images ? images.split("\n").map((s) => s.trim()).filter(Boolean) : [];

  if (!name || !price || !gender || !category || imageList.length === 0) {
    const adminProducts = products.readAdminProducts();
    return res.render("admin", {
      title: "Admin | Zeenat",
      adminProducts: adminProducts.slice().reverse(),
      categories: products.CATEGORIES,
      genders: products.GENDERS,
      isExpired: products.isExpired,
      error: "Please fill in name, price, gender, category and at least one image URL.",
    });
  }

  const id = "adm-" + randomUUID().slice(0, 8);
  const sizeList = sizes ? sizes.split(",").map((s) => s.trim()).filter(Boolean) : ["One Size"];
  const colorList = colors ? colors.split(",").map((c) => c.trim()).filter(Boolean) : [];

  // deterministic-ish rating for consistency with the rest of the catalog
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000;

  const newProduct = {
    id,
    name,
    gender,
    category,
    price: parseFloat(price) || 0,
    currency: currency || "PKR",
    image: imageList[0],
    images: imageList,
    description: description || "",
    sizes: sizeList,
    colors: colorList,
    stock: parseInt(stock, 10) || 10,
    rating: (4 + (hash % 10) / 10).toFixed(1),
    reviewCount: 8 + (hash % 45),
    addedAt: new Date().toISOString(),
  };

  if (affiliateLink && affiliateLink.trim()) {
    newProduct.affiliateLink = affiliateLink.trim();
  }

  if (saleEndDate && saleEndDate.trim()) {
    newProduct.saleEndDate = saleEndDate.trim();
  }

  const adminProducts = products.readAdminProducts();
  adminProducts.push(newProduct);
  products.writeAdminProducts(adminProducts);

  res.redirect("/admin");
});

router.post("/admin/products/delete", requireAdmin, (req, res) => {
  const { id } = req.body;
  const adminProducts = products.readAdminProducts().filter((p) => p.id !== id);
  products.writeAdminProducts(adminProducts);
  res.redirect("/admin");
});

module.exports = router;
