const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });
});

describe('Products CRUD API', () => {
    let createdProductId;

    // POST - Create
    it('POST /api/products - should create a new product', async () => {
        const newProduct = {
            name: 'Test Product',
            price: 19.99,
            category: 'Testing',
            inStock: true,
            description: 'A test product',
        };

        const res = await request(app)
            .post('/api/products')
            .send(newProduct)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Product');
        expect(res.body.price).toBe(19.99);
        expect(res.body.category).toBe('Testing');
        createdProductId = res.body.id;
    });

    // POST - Validation
    it('POST /api/products - should return 400 if name is missing', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({ price: 10, category: 'Test' })
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    // GET all
    it('GET /api/products - should return array of products', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // GET by ID
    it('GET /api/products/:id - should return the created product', async () => {
        const res = await request(app).get(`/api/products/${createdProductId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toBe('Test Product');
    });

    // GET by ID - Not Found
    it('GET /api/products/:id - should return 404 for non-existent', async () => {
        const res = await request(app).get('/api/products/99999');
        expect(res.statusCode).toEqual(404);
    });

    // PUT - Update
    it('PUT /api/products/:id - should update the product', async () => {
        const res = await request(app)
            .put(`/api/products/${createdProductId}`)
            .send({ name: 'Updated Product', price: 29.99 })
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toBe('Updated Product');
        expect(res.body.price).toBe(29.99);
    });

    // DELETE
    it('DELETE /api/products/:id - should delete the product', async () => {
        const res = await request(app).delete(`/api/products/${createdProductId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    });

    // DELETE - Not Found after deletion
    it('GET /api/products/:id - should return 404 after deletion', async () => {
        const res = await request(app).get(`/api/products/${createdProductId}`);
        expect(res.statusCode).toEqual(404);
    });

    // GET categories
    it('GET /api/products/categories - should return array of strings', async () => {
        const res = await request(app).get('/api/products/categories');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // Cleanup Prisma connection after all tests
    afterAll(async () => {
        await app.prisma.$disconnect();
    });
});