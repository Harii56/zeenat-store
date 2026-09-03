// Very simple file-based persistence layer for Users and Orders.
// Uses local JSON files so no external database server is required.

const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "users.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");

function ensureFile(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFile(USERS_FILE, []);
ensureFile(ORDERS_FILE, []);

function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ---------- Users ----------
function getUsers() {
  return readJSON(USERS_FILE);
}

function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function addUser(user) {
  const users = getUsers();
  users.push(user);
  writeJSON(USERS_FILE, users);
  return user;
}

// ---------- Orders ----------
function getOrders() {
  return readJSON(ORDERS_FILE);
}

function getOrdersByUser(userId) {
  return getOrders().filter((o) => o.userId === userId);
}

function addOrder(order) {
  const orders = getOrders();
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  return order;
}

module.exports = {
  getUsers,
  findUserByEmail,
  addUser,
  getOrders,
  getOrdersByUser,
  addOrder,
};
