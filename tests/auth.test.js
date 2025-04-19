const request = require('supertest');
const app = require('../src/app'); // Asegúrate de que esta sea la ruta correcta a tu app
const db = require('../src/models');

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('Auth Endpoints - Registro y Login', () => {
  const testUser = {
    nombre: 'Alexis',
    email: 'test@alumnos.udg.mx',
    password: 'test1234',
    telefono: '3312345678',
    codigo_UDG: '123456789'
  };

  it('POST /api/auth/register - debe registrar un usuario con correo válido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Usuario registrado exitosamente');
    expect(res.body.user).toBeDefined();
  });

  it('POST /api/auth/register - debe fallar con correo no permitido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'no@otrodominio.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Correo no permitido');
  });

  it('POST /api/auth/login - debe iniciar sesión con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Inicio de sesión exitoso');
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login - debe fallar con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'incorrecta123'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Credenciales inválidas');
  });
});
