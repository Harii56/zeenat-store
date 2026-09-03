const express = require("express");
const router = express.Router();
const products = require("../data/products");

// GET /shop/suggest?q=... -> JSON matches for search auto-suggest
router.get("/suggest", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const matches = products
    .filter({ search: q })
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: p.currency || "PKR",
      image: p.image,
      category: p.category,
    }));

  res.json(matches);
});

// GET /shop  -> listing with optional filters ?gender=women&category=dresses&search=silk
router.get("/", (req, res) => {
  const { gender, category, search } = req.query;
  const items = products.filter({ gender, category, search });

  const genderLabel = gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "All";
  const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  res.render("category", {
    title: `${genderLabel} ${categoryLabel} | Zeenat`,
    items,
    gender: gender || "",
    category: category || "",
    search: search || "",
  });
});

// GET /shop/product/:id -> single product detail page
router.get("/product/:id", (req, res) => {
  const item = products.getById(req.params.id);
  if (!item) {
    return res.status(404).render("404", { title: "Product Not Found" });
  }

  // simple "related products" - same category, excluding current item
  const related = products
    .filter({ category: item.category })
    .filter((p) => p.id !== item.id)
    .slice(0, 4);

  res.render("product", {
    title: `${item.name} | Zeenat`,
    item,
    related,
    ogType: "product",
    ogTitle: `${item.name} | Zeenat`,
    ogDescription: item.description,
    ogImage: item.image,
    ogPrice: item.price,
  });
});

module.exports = router;
