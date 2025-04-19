const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models');

let tokenVendedor;
let vendedorId;
let categoriaId;
let productoId;

let tokenAdmin;


const bcrypt = require('bcryptjs');

beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  
    // Crear usuario ADMIN usando el endpoint de registro
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Admin',
        email: 'admin@alumnos.udg.mx',
        password: 'admin123',
        telefono: '3312345678',
        codigo_UDG: '11112222',
        rol: 'admin'
      });
  
    // Login del admin
    const resAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@alumnos.udg.mx',
        password: 'admin123'
      });
  
    expect(resAdminLogin.statusCode).toBe(200);
    tokenAdmin = resAdminLogin.body.token;
  
    // Crear categoría con el token del admin
    const resCategoria = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Electrónica',
        descripcion: 'Productos electrónicos'
      });
  
    expect(resCategoria.statusCode).toBe(201);
    categoriaId = resCategoria.body.data.categoria_id;
  
    // Crear usuario VENDEDOR usando el endpoint de registro
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Vendedor',
        email: 'vendedor@alumnos.udg.mx',
        password: 'vendedor123',
        telefono: '3312345678',
        codigo_UDG: '88889999',
        rol: 'seller'
      });
  
    // Login del vendedor
    const resVendedorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vendedor@alumnos.udg.mx',
        password: 'vendedor123'
      });
  
    expect(resVendedorLogin.statusCode).toBe(200);
    tokenVendedor = resVendedorLogin.body.token;
    vendedorId = resVendedorLogin.body.user.user_id;
  });


afterAll(async () => {
  await db.sequelize.close();
});

describe('Product Service Endpoints', () => {
    it('POST /api/products - debe crear un producto como vendedor', async () => {
        const res = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${tokenVendedor}`)
          .send({
            nombre: 'Celular x',
            descripcion: 'Celular gama media',
            precio: 5000,
            cantidad_disponible: 10,
            imagen: 'celular.png',
            categoria_id: categoriaId
          });
      
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('nombre', 'Celular x');
      
        productoId = res.body.data.producto_id;
      });
      
      it('GET /api/products/:productId - debe devolver detalles del producto', async () => {
        const res = await request(app)
          .get(`/api/products/${productoId}`)
          .set('Authorization', `Bearer ${tokenVendedor}`);
      
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('producto_id', productoId);
        expect(res.body.data).toHaveProperty('nombre', 'Celular x');
      });
      
      
      it('GET /api/products/category/:categoryId - debe devolver productos por categoría', async () => {
        const res = await request(app)
          .get(`/api/products/category/${categoriaId}`)
          .set('Authorization', `Bearer ${tokenVendedor}`);
      
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(false); // la respuesta debe ser { success, data }
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
      
      it('GET /api/products/vendor/my-products - debe devolver productos del vendedor autenticado', async () => {
        const res = await request(app)
          .get('/api/products/vendor/my-products')
          .set('Authorization', `Bearer ${tokenVendedor}`);
      
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0]).toHaveProperty('producto_id', productoId);
      });

      it('PUT /api/products/:productId - debe actualizar el producto', async () => {
        const res = await request(app)
          .put(`/api/products/${productoId}`)
          .set('Authorization', `Bearer ${tokenVendedor}`)
          .send({
            nombre: 'Celular actualizado',
            precio: 4800,
            cantidad_disponible: 5
          });
      
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('nombre', 'Celular actualizado');
        expect(Number(res.body.data.precio)).toBe(4800);
        expect(res.body.data).toHaveProperty('cantidad_disponible', 5);
      });

      it('DELETE /api/products/:productId - debe eliminar el producto', async () => {
        const res = await request(app)
          .delete(`/api/products/${productoId}`)
          .set('Authorization', `Bearer ${tokenVendedor}`);
      
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('eliminado');
      });
      
      
      
});
