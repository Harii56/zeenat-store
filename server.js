const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");

const productsData = require("./data/products");
const { formatPrice } = require("./data/currency");

const indexRoutes = require("./routes/index");
const shopRoutes = require("./routes/shop");
const cartRoutes = require("./routes/cart");
const authRoutes = require("./routes/auth");
const checkoutRoutes = require("./routes/checkout");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sessions (used for cart + login state)
app.use(
  session({
    secret: "boutique-final-year-project-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Make cart, user & flash messages available in every view
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = {};

  const cart = req.session.cart;
  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  res.locals.cartCount = cartCount;
  res.locals.currentUser = req.session.user || null;
  res.locals.categories = productsData.CATEGORIES;
  res.locals.categoriesForGender = productsData.categoriesForGender;
  res.locals.genders = productsData.GENDERS;
  res.locals.formatPrice = formatPrice;

  // simple one-time flash message system
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;

  next();
});

// Routes
app.use("/", indexRoutes);
app.use("/shop", shopRoutes);
app.use("/cart", cartRoutes);
app.use("/", authRoutes);
app.use("/", adminRoutes);
app.use("/checkout", checkoutRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.listen(PORT, () => {
  console.log(`\n  ✔ Boutique store running at: http://localhost:${PORT}\n`);
});
