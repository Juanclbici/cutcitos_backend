const request = require('supertest');
const app = require('../src/app'); 
const { sequelize } = require('../src/models');

let userToken;
let remitenteId;
let destinatarioId;

beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });

    // Crear correos válidos con timestamp para que no choquen
    const timestamp = Date.now();
    const emailRemitente = `remitente_${timestamp}@alumnos.udg.mx`;
    const emailDestinatario = `destinatario_${timestamp}@alumnos.udg.mx`;

    // Crear usuario remitente
    await request(app).post('/api/auth/register').send({
      nombre: 'Usuario Remitente',
      email: emailRemitente,
      password: '123456',
      rol: 'buyer'
    });

    // Crear usuario destinatario
    await request(app).post('/api/auth/register').send({
      nombre: 'Usuario Destinatario',
      email: emailDestinatario,
      password: '123456',
      rol: 'seller'
    });

    // Activar cuentas
    await sequelize.models.User.update({ activo: true }, { where: { email: [emailRemitente, emailDestinatario] } });

    // Iniciar sesión con remitente
    const loginRemitente = await request(app).post('/api/auth/login').send({
      email: emailRemitente,
      password: '123456'
    });

    // Iniciar sesión con destinatario
    const loginDestinatario = await request(app).post('/api/auth/login').send({
      email: emailDestinatario,
      password: '123456'
    });

    // Asignar token y IDs correctamente
    userToken = `Bearer ${loginRemitente.body.token}`;
    remitenteId = loginRemitente.body.user.user_id;
    destinatarioId = loginDestinatario.body.user.user_id;

  } catch (error) {
    console.error('Error en beforeAll:', error);
  }
});

describe('Pruebas de mensajes', () => {
  test('POST /api/messages - enviar mensaje', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', userToken)
      .send({
        destinatario_id: destinatarioId,
        mensaje: 'Hola desde el test'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensaje');
  });

  test('GET /api/messages/inbox - bandeja tipo WhatsApp', async () => {
    const res = await request(app)
      .get('/api/messages/inbox')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/messages/conversation/:remitenteId/:destinatarioId - historial entre dos usuarios', async () => {
    const res = await request(app)
    .get(`/api/messages/conversation/${remitenteId}`)
    .set('Authorization', userToken);  

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/messages/conversations - historial completo', async () => {
    const res = await request(app)
      .get('/api/messages/conversations')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
