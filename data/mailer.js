// Sends email notifications to the store owner for new signups and orders.
// Uses Gmail SMTP via environment variables so no credentials are hardcoded:
//   EMAIL_USER     - the Gmail address that will SEND the notification
//   EMAIL_PASS     - a Gmail "App Password" (not your normal password)
//   NOTIFY_EMAIL   - the address that should RECEIVE notifications (can be
//                    the same as EMAIL_USER, or a different inbox you check)
//
// If these aren't set, notifications are silently skipped so the site
// keeps working normally — signups/orders are never blocked by email issues.

const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendNotification(subject, text) {
  const t = getTransporter();
  const to = process.env.NOTIFY_EMAIL || process.env.EMAIL_USER;
  if (!t || !to) return; // not configured - skip quietly

  try {
    await t.sendMail({
      from: `"Zeenat Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    // Never let an email failure break signup/checkout for the customer.
    console.error("Email notification failed:", err.message);
  }
}

function notifyNewSignup(user) {
  return sendNotification(
    "🎉 New Signup on Zeenat",
    `A new customer just registered:\n\nName: ${user.name}\nEmail: ${user.email}\n\nTime: ${new Date().toLocaleString()}`
  );
}

function notifyNewOrder(order) {
  const itemLines = order.items
    .map((i) => `- ${i.name} × ${i.qty} (${i.size}) — ${i.subtotal}`)
    .join("\n");

  return sendNotification(
    `🛍️ New Order #${order.id} on Zeenat`,
    `A new order has been placed!\n\nOrder ID: ${order.id}\nCustomer: ${order.shippingInfo.fullName}\nPhone: ${order.shippingInfo.phone}\nAddress: ${order.shippingInfo.address}, ${order.shippingInfo.city}\nPayment: ${order.paymentMethod}\n\nItems:\n${itemLines}\n\nTotal: ${order.total}\n\nTime: ${new Date().toLocaleString()}`
  );
}

function notifyNewFeedback(feedback) {
  return sendNotification(
    "💬 New Feedback on Zeenat",
    `Someone left feedback on your site:\n\nName: ${feedback.name}\nEmail: ${feedback.email}\n\nMessage:\n${feedback.message}\n\nTime: ${new Date().toLocaleString()}`
  );
}

module.exports = { notifyNewSignup, notifyNewOrder, notifyNewFeedback };
