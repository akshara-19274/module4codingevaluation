const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'db.json');

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return {
      products: Array.isArray(data.products) ? data.products : [],
      orders: Array.isArray(data.orders) ? data.orders : [],
    };
  } catch {
    return { products: [], orders: [] };
  }
}

function writeDB(data) {
  const safe = {
    products: Array.isArray(data.products) ? data.products : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(safe, null, 2), 'utf-8');
}

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map(i => i.id)) + 1;
}

module.exports = { readDB, writeDB, getNextId };