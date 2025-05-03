const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models');

let userToken;
let remitenteId;
let destinatarioId;

beforeAll(async () => {
  try {
    await db.sequelize.sync({ force: true });
    await new Promise(resolve => setTimeout(resolve, 500));

    const emailRem = `rem_${Date.now()}@cutcitos.com`;
    const emailDest = `dest_${Date.now()}@cutcitos.com`;

    // Registrar remitente
    await request(app).post('/api/auth/register').send({
      nombre: 'Rem',
      email: emailRem,
      password: '123456',
      telefono: '3311111111',
      codigo_UDG: '123456789',
      rol: 'buyer'
    });

    // Registrar destinatario
    await request(app).post('/api/auth/register').send({
      nombre: 'Dest',
      email: emailDest,
      password: '123456',
      telefono: '3322222222',
      codigo_UDG: '987654321',
      rol: 'seller'
    });

    // Activar cuentas
    await db.User.update({ estado_cuenta: 'active' }, {
      where: { email: [emailRem, emailDest] }
    });

    // Login del remitente
    const loginRemitente = await request(app).post('/api/auth/login').send({
      email: emailRem,
      password: '123456'
    });

    userToken = `Bearer ${loginRemitente.body.token}`;
    remitenteId = loginRemitente.body.user.id;

    // Login del destinatario (solo para obtener ID)
    const loginDest = await request(app).post('/api/auth/login').send({
      email: emailDest,
      password: '123456'
    });

    destinatarioId = loginDest.body.user.id;

  } catch (error) {
    console.error('Error en beforeAll de mensajes:', error);
  }
});

describe('ENDPOINTS DE MENSAJERÍA Y NOTIFICACIONES', () => {
  test('GET /api/messages/inbox → debe retornar bandeja de entrada', async () => {
    const res = await request(app)
      .get('/api/messages/inbox')
      .set('Authorization', userToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/messages/ → debe crear un nuevo mensaje', async () => {
    const nuevoMensaje = {
      mensaje: 'Mensaje desde Jest',
      remitente_id: remitenteId,
      destinatario_id: destinatarioId
    };

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', userToken)
      .send(nuevoMensaje);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensaje', nuevoMensaje.mensaje);
  });

  test('GET /api/messages/conversation/:remitenteId/:destinatarioId', async () => {
    const res = await request(app)
      .get(`/api/messages/conversation/${remitenteId}/${destinatarioId}`)
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/messages/conversations → historial completo del usuario', async () => {
    const res = await request(app)
      .get('/api/messages/conversations')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll(async () => {
  await db.sequelize.close();
});
