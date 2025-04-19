const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models');

let userToken;
let userId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });

  // Crear usuario buyer
  const resRegister = await request(app)
    .post('/api/auth/register')
    .send({
      nombre: 'Alexis',
      email: 'alexis@alumnos.udg.mx',
      password: 'test1234',
      telefono: '3334445566',
      codigo_UDG: '123456789'
    });

  userToken = resRegister.body.token;
  userId = resRegister.body.user.user_id;
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('User Service Endpoints', () => {
it('GET /api/users/profile - debe devolver el perfil del usuario autenticado', async () => {
        const res = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${userToken}`);
      
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email', 'alexis@alumnos.udg.mx');
    });
      

    it('PUT /api/users/profile - debe actualizar el perfil del usuario', async () => {
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            nombre: 'Alexis Modificado',
            telefono: '3339998877',
            codigo_UDG: '123456789' 
          });
      
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Perfil actualizado exitosamente');
        expect(res.body.user).toHaveProperty('nombre', 'Alexis Modificado');
        expect(res.body.user).toHaveProperty('telefono', '3339998877');
      });
      

      it('GET /api/users/profile - debe mostrar los datos actualizados', async () => {
        const res = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${userToken}`);
      
        expect(res.statusCode).toBe(200);
        expect(res.body.nombre).toBe('Alexis Modificado');
        expect(res.body.telefono).toBe('3339998877');
      });
      
});
