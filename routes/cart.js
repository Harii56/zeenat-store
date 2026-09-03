const express = require("express");
const router = express.Router();
const products = require("../data/products");

// GET /cart -> view cart contents
router.get("/", (req, res) => {
  const cart = req.session.cart || {};
  const items = Object.entries(cart).map(([id, entry]) => {
    const product = products.getById(id);
    return {
      product,
      qty: entry.qty,
      size: entry.size,
      subtotal: product ? product.price * entry.qty : 0,
    };
  }).filter((i) => i.product); // guard against removed products

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  res.render("cart", {
    title: "Your Cart | Zeenat",
    items,
    total,
  });
});

// POST /cart/add
router.post("/add", (req, res) => {
  const { productId, size, qty } = req.body;
  const product = products.getById(productId);

  if (!product) {
    req.session.flash = { type: "error", text: "Product not found." };
    return res.redirect("back");
  }

  const quantity = Math.max(1, parseInt(qty, 10) || 1);
  const chosenSize = size || product.sizes[0];

  const cart = req.session.cart || {};
  const key = productId;

  if (cart[key]) {
    cart[key].qty += quantity;
    cart[key].size = chosenSize;
  } else {
    cart[key] = { qty: quantity, size: chosenSize };
  }

  req.session.cart = cart;
  req.session.flash = { type: "success", text: `${product.name} added to your cart.` };

  res.redirect("/cart");
});

// POST /cart/update
router.post("/update", (req, res) => {
  const { productId, qty } = req.body;
  const cart = req.session.cart || {};

  if (cart[productId]) {
    const quantity = Math.max(1, parseInt(qty, 10) || 1);
    cart[productId].qty = quantity;
  }

  req.session.cart = cart;
  res.redirect("/cart");
});

// POST /cart/remove
router.post("/remove", (req, res) => {
  const { productId } = req.body;
  const cart = req.session.cart || {};
  delete cart[productId];
  req.session.cart = cart;
  res.redirect("/cart");
});

module.exports = router;
