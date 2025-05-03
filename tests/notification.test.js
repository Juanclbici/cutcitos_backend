const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models');

let userToken;
let userId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  await new Promise(resolve => setTimeout(resolve, 500));

  const email = `notificador_${Date.now()}@cutcitos.com`;

  await request(app).post('/api/auth/register').send({
    nombre: 'Notificador',
    email,
    password: '123456',
    telefono: '3333333333',
    codigo_UDG: '123456789',
    rol: 'buyer'
  });

  await db.User.update({ estado_cuenta: 'active' }, {
    where: { email }
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email,
    password: '123456'
  });

  userToken = `Bearer ${loginRes.body.token}`;
  userId = loginRes.body.user.user_id;

  await db.Notification.bulkCreate([
    {
      usuario_id: userId,
      estado_notificacion: 'no_leida',
      tipo_notificacion: 'sistema',
      mensaje: 'No leída 1'
    },
    {
      usuario_id: userId,
      estado_notificacion: 'no_leida',
      tipo_notificacion: 'sistema',
      mensaje: 'No leída 2'
    },
    {
      usuario_id: userId,
      estado_notificacion: 'leida',
      tipo_notificacion: 'sistema',
      mensaje: 'Leída'
    }
  ]);
});

describe('ENDPOINT DE NOTIFICACIONES', () => {
  test('GET /api/notifications/unread-count → debe contar notificaciones no leídas', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('no_leidas', 2);
  });

  test('GET /api/notifications/unread-count → sin token debe fallar con 401', async () => {
    const res = await request(app).get('/api/notifications/unread-count');
    expect(res.statusCode).toBe(401);
  });
});

afterAll(async () => {
  await db.sequelize.close();
});