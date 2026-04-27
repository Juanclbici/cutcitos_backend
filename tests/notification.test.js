const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models');

let userToken;
let userId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  await new Promise(resolve => setTimeout(resolve, 500));

  // Usar dominio válido
  const email = `notificador_${Date.now()}@alumnos.udg.mx`;

  // 1. Registrar usuario
  const registerRes = await request(app).post('/api/auth/register').send({
    nombre: 'Usuario Noti',
    email,
    password: '123456',
    rol: 'buyer'
  });

  console.log('Registro response:', registerRes.body);

  // 2. Activar cuenta
  await db.User.update({ activo: true }, {
    where: { email }
  });

  // 3. Iniciar sesión
  const loginRes = await request(app).post('/api/auth/login').send({
    email,
    password: '123456'
  });

  console.log('Login response:', loginRes.body);

  //Asignar token e ID
  userToken = `Bearer ${loginRes.body.token}`;
  userId = loginRes.body.user.user_id;

  // 4. Crear notificaciones para el test
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