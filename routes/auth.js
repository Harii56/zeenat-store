const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const store = require("../data/store");
const { notifyNewSignup } = require("../data/mailer");

// ---------- Register ----------
router.get("/register", (req, res) => {
  res.render("register", { title: "Create Account | Zeenat", error: null });
});

router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return res.render("register", { title: "Create Account | Zeenat", error: "Please fill in all fields." });
  }

  if (password !== confirmPassword) {
    return res.render("register", { title: "Create Account | Zeenat", error: "Passwords do not match." });
  }

  if (store.findUserByEmail(email)) {
    return res.render("register", { title: "Create Account | Zeenat", error: "An account with this email already exists." });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const user = { id: randomUUID(), name, email, password: hashed };
  store.addUser(user);

  notifyNewSignup(user); // fire-and-forget - never delays the response

  req.session.user = { id: user.id, name: user.name, email: user.email };
  req.session.flash = { type: "success", text: `Welcome, ${user.name}!` };
  res.redirect("/");
});

// ---------- Login ----------
router.get("/login", (req, res) => {
  res.render("login", { title: "Login | Zeenat", error: null });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = store.findUserByEmail(email || "");

  if (!user || !bcrypt.compareSync(password || "", user.password)) {
    return res.render("login", { title: "Login | Zeenat", error: "Invalid email or password." });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  req.session.flash = { type: "success", text: `Welcome back, ${user.name}!` };

  const redirectTo = req.session.redirectAfterLogin || "/";
  req.session.redirectAfterLogin = null;
  res.redirect(redirectTo);
});

// ---------- Profile ----------
router.get("/profile", (req, res) => {
  if (!req.session.user) {
    req.session.redirectAfterLogin = "/profile";
    req.session.flash = { type: "error", text: "Please login to view your profile." };
    return res.redirect("/login");
  }

  const orders = store.getOrdersByUser(req.session.user.id).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.render("profile", {
    title: "My Profile | Zeenat",
    orders,
  });
});

// ---------- Logout ----------
router.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});

module.exports = router;
