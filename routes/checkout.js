const express = require("express");
const router = express.Router();
const { randomUUID } = require("crypto");
const products = require("../data/products");
const store = require("../data/store");
const { notifyNewOrder } = require("../data/mailer");

function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.redirectAfterLogin = "/checkout";
    req.session.flash = { type: "error", text: "Please login to proceed to checkout." };
    return res.redirect("/login");
  }
  next();
}

// GET /checkout
router.get("/", requireLogin, (req, res) => {
  const cart = req.session.cart || {};
  const items = Object.entries(cart).map(([id, entry]) => {
    const product = products.getById(id);
    return {
      product,
      qty: entry.qty,
      size: entry.size,
      subtotal: product ? product.price * entry.qty : 0,
    };
  }).filter((i) => i.product);

  if (items.length === 0) {
    req.session.flash = { type: "error", text: "Your cart is empty." };
    return res.redirect("/cart");
  }

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  res.render("checkout", {
    title: "Checkout | Zeenat",
    items,
    subtotal,
    shipping,
    total,
    error: null,
  });
});

// POST /checkout -> place the order (mock payment, no real transaction)
router.post("/", requireLogin, (req, res) => {
  const cart = req.session.cart || {};
  const items = Object.entries(cart).map(([id, entry]) => {
    const product = products.getById(id);
    return {
      productId: id,
      name: product ? product.name : "Unknown",
      price: product ? product.price : 0,
      currency: product ? (product.currency || "PKR") : "PKR",
      qty: entry.qty,
      size: entry.size,
      subtotal: product ? product.price * entry.qty : 0,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  const { fullName, address, city, phone, paymentMethod, cardNumber } = req.body;

  if (!fullName || !address || !city || !phone) {
    req.session.flash = { type: "error", text: "Please complete all shipping details." };
    return res.redirect("/checkout");
  }

  if (paymentMethod === "card" && (!cardNumber || cardNumber.replace(/\s/g, "").length < 12)) {
    req.session.flash = { type: "error", text: "Please enter a valid card number." };
    return res.redirect("/checkout");
  }

  const order = {
    id: randomUUID().slice(0, 8).toUpperCase(),
    userId: req.session.user.id,
    items,
    subtotal,
    shipping,
    total,
    shippingInfo: { fullName, address, city, phone },
    paymentMethod: paymentMethod === "card" ? "Card" : "Cash on Delivery",
    createdAt: new Date().toISOString(),
  };

  store.addOrder(order);
  notifyNewOrder(order); // fire-and-forget - never delays the response

  // clear cart
  req.session.cart = {};

  res.render("order-success", {
    title: "Order Confirmed | Zeenat",
    order,
  });
});

module.exports = router;
