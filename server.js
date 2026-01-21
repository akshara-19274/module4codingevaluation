const express = require('express');
const app = express();

const productsRouter = require('./routes/product.routes');
const ordersRouter = require('./routes/orders.routes');
const analyticsRouter = require('./routes/analytics.routes');

app.use(express.json());

// Routers
app.use('/product', productsRouter);
app.use('/orders', ordersRouter);
app.use('/analytics', analyticsRouter);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'E-commerce API running on HTTP' });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});