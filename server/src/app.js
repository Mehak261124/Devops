const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShopSmart Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// PRODUCTS CRUD API
// ============================================================

// GET /api/products - List all products (with optional search & category filter)
app.get('/api/products', async (req, res) => {
  try {
    const { q, category } = req.query;
    const where = {};

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { category: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/categories - Get unique categories
app.get('/api/products/categories', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    const categories = products.map(p => p.category);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/products/:id - Get a single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, category, inStock, description, image } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        category: category.trim(),
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        description: description ? description.trim() : '',
        image: image || '',
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, price, category, inStock, description, image } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category.trim();
    if (inStock !== undefined) updateData.inStock = Boolean(inStock);
    if (description !== undefined) updateData.description = description.trim();
    if (image !== undefined) updateData.image = image;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('ShopSmart Backend Service');
});

// Export for testing
app.prisma = prisma;
module.exports = app;