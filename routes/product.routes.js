const express = require('express');
const router = express.Router();
const { readDB, writeDB, getNextId } = require('../utils/db');

router.get('/', (req, res) => {
  const { products } = readDB();
  return res.status(200).json({ success: true, count: products.length, products });
});

router.post('/', (req, res) => {
  const { name, price, stock } = req.body;
  if (!name || typeof price !== 'number' || typeof stock !== 'number' || price < 0 || stock < 0) {
    return res.status(400).json({ success: false, message: 'Invalid product payload' });
  }
  const db = readDB();
  const newProduct = { id: getNextId(db.products), name, price, stock };
  db.products.push(newProduct);
  writeDB(db);
  return res.status(201).json({ success: true, product: newProduct });
});

router.get('/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  const { products } = readDB();
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  return res.status(200).json({ success: true, product });
});

module.exports = router;