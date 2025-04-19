const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models');
const bcrypt = require('bcryptjs');

let adminToken;
let categoryId;

beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  
    // Crear usuario admin usando el endpoint de registro
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Admin',
        email: 'admin@alumnos.udg.mx',
        password: 'admin123',
        telefono: '3312345678',
        codigo_UDG: '999999999',
        rol: 'admin'
      });
  
    // Login para obtener token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@alumnos.udg.mx',
        password: 'admin123'
      });
  
    adminToken = loginRes.body.token;
  });
  

afterAll(async () => {
  await db.sequelize.close();
});

describe('Category Endpoints', () => {
  it('POST /api/categories - debe crear una nueva categoría (admin)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Tecnología',
        descripcion: 'Categoría de productos tecnológicos',
        imagen: 'tecnologia.jpg'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('nombre', 'Tecnología');
    expect(res.body.data).toHaveProperty('categoria_id');

    categoryId = res.body.data.categoria_id;
    expect(typeof categoryId).toBe('number');
  });

  it('GET /api/categories - debe devolver todas las categorías', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/categories/:id - debe devolver una categoría por ID', async () => {
    const res = await request(app).get(`/api/categories/${categoryId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('categoria_id', categoryId);
    expect(res.body.data).toHaveProperty('nombre', 'Tecnología');
  });

  it('GET /api/categories/:id - debe devolver 404 si no existe', async () => {
    const res = await request(app).get('/api/categories/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
