const express = require("express");
const router = express.Router();
const products = require("../data/products");
const { notifyNewFeedback } = require("../data/mailer");

router.get("/", (req, res) => {
  const all = products.getAll();

  // Pick a few featured items per gender for the homepage
  const featuredWomen = all.filter((p) => p.gender === "women").slice(0, 4);
  const featuredMen = all.filter((p) => p.gender === "men").slice(0, 4);
  const featuredKids = all.filter((p) => p.gender === "kids").slice(0, 4);

  res.render("home", {
    title: "Zeenat | Home",
    featuredWomen,
    featuredMen,
    featuredKids,
    ogTitle: "Zeenat — Style, Curated For Everyone",
    ogDescription: "A curated boutique for women, men & kids — dresses, jewelry, bags, glasses, jackets, pants & shirts.",
    ogImage: "https://picsum.photos/seed/hero-fashion/1200/630",
  });
});

router.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy", { title: "Privacy & Cookie Policy | Zeenat" });
});

router.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact Us | Zeenat", sent: false, error: null });
});

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.render("contact", {
      title: "Contact Us | Zeenat",
      sent: false,
      error: "Please fill in all fields.",
    });
  }

  await notifyNewFeedback({ name, email, message });

  res.render("contact", { title: "Contact Us | Zeenat", sent: true, error: null });
});

module.exports = router;
