const express = require('express');
const router = express.Router();
const { readDB } = require('../utils/db');

function withProductPrice(orders, products) {
  return orders.map(order => {
    const product = products.find(p => p.id === order.productId);
    return { ...order, productPrice: product ? product.price : 0 };
  });
}

router.get('/allorders', (req, res) => {
  const { orders } = readDB();
  const list = orders.map(o => ({ ...o }));
  return res.status(200).json({ success: true, count: list.length, orders: list });
});

router.get('/cancelled-orders', (req, res) => {
  const { orders } = readDB();
  const cancelled = orders.filter(o => o.status === 'cancelled');
  return res.status(200).json({ success: true, count: cancelled.length, orders: cancelled });
});

router.get('/shipped', (req, res) => {
  const { orders } = readDB();
  const shipped = orders.filter(o => o.status === 'shipped');
  return res.status(200).json({ success: true, count: shipped.length, orders: shipped });
});

router.get('/total-revenue/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  const { orders, products } = readDB();

  const relevant = orders
    .filter(o => o.productId === productId)
    .filter(o => o.status !== 'cancelled');

  const joined = withProductPrice(relevant, products);
  const totalRevenue = joined.reduce((sum, o) => sum + (o.quantity * o.productPrice), 0);

  return res.status(200).json({ success: true, productId, count: joined.length, totalRevenue });
});

router.get('/alltotalrevenue', (req, res) => {
  const { orders, products } = readDB();
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const joined = withProductPrice(activeOrders, products);
  const totalRevenue = joined.reduce((sum, o) => sum + (o.quantity * o.productPrice), 0);

  return res.status(200).json({ success: true, count: joined.length, totalRevenue });
});

module.exports = router;