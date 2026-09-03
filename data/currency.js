// Simple multi-currency price formatter.
// Products default to PKR; international (UK/USA) products can be tagged
// with currency: "USD" or "GBP" in the admin panel, and will display with
// the correct symbol everywhere on the site.

const SYMBOLS = {
  PKR: "Rs. ",
  USD: "$",
  GBP: "£",
};

function formatPrice(amount, currency) {
  const code = (currency || "PKR").toUpperCase();
  const symbol = SYMBOLS[code] || SYMBOLS.PKR;
  const value = Number(amount) || 0;

  if (code === "PKR") {
    return symbol + Math.round(value).toLocaleString();
  }
  return symbol + value.toFixed(2);
}

module.exports = { formatPrice, SYMBOLS };
