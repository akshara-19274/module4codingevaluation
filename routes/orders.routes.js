const express = require('express');
const router = express.Router();
const { readDB, writeDB, getNextId } = require('../utils/db');

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

router.post('/', (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);
  const pid = Number(productId);

  if (!pid || !qty || qty <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid productId or quantity' });
  }

  const db = readDB();
  const product = db.products.find(p => p.id === pid);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (product.stock === 0) {
    return res.status(400).json({ success: false, message: 'Insufficient stock: product out of stock' });
  }
  if (qty > product.stock) {
    return res.status(400).json({ success: false, message: 'Insufficient stock: ordered quantity exceeds available stock' });
  }

  const totalAmount = product.price * qty;
  const newOrder = {
    id: getNextId(db.orders),
    productId: pid,
    quantity: qty,
    totalAmount,
    status: 'placed',
    createdAt: todayISO(),
  };

  product.stock -= qty;
  db.orders.push(newOrder);
  writeDB(db);

  return res.status(201).json({ success: true, order: newOrder });
});

router.get('/', (req, res) => {
  const { orders } = readDB();
  return res.status(200).json({ success: true, count: orders.length, orders });
});

router.delete('/:orderId', (req, res) => {
  const orderId = Number(req.params.orderId);
  const db = readDB();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (order.status === 'cancelled') {
    return res.status(400).json({ success: false, message: 'Order already cancelled' });
  }

  const isSameDay = order.createdAt === todayISO();
  if (!isSameDay) {
    return res.status(400).json({ success: false, message: 'Cancellation allowed only on the same day as creation' });
  }

  const product = db.products.find(p => p.id === order.productId);
  if (!product) {
    order.status = 'cancelled';
    writeDB(db);
    return res.status(200).json({ success: true, message: 'Order cancelled, product missing—stock not reverted', order });
  }

  product.stock += order.quantity;
  order.status = 'cancelled';
  writeDB(db);

  return res.status(200).json({ success: true, message: 'Order cancelled and stock reverted', order });
});

router.patch('/change-status/:orderId', (req, res) => {
  const orderId = Number(req.params.orderId);
  const { nextStatus } = req.body;
  const db = readDB();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (order.status === 'cancelled' || order.status === 'delivered') {
    return res.status(400).json({ success: false, message: 'Cannot change status of cancelled or delivered orders' });
  }

  const validTransitions = { placed: 'shipped', shipped: 'delivered' };
  const expectedNext = validTransitions[order.status];

  if (nextStatus !== expectedNext) {
    return res.status(400).json({ success: false, message: `Invalid status transition. Expected next: '${expectedNext}'` });
  }

  order.status = nextStatus;
  writeDB(db);
  return res.status(200).json({ success: true, order });
});

module.exports = router;