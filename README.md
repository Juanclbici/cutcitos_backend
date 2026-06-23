# Cutcitos API (UDG Marketplace) - Legacy v1

¡Bienvenido al repositorio de **Cutcitos Backend**! Este proyecto es una API REST diseñada para alimentar un *marketplace* exclusivo para la comunidad estudiantil de la Universidad de Guadalajara (UDG), permitiendo a los alumnos comprar, vender e intercambiar productos o servicios.

> **Nota Histórica (Legacy Branch):** Esta es la **Versión 1** del proyecto, construida nativamente en JavaScript. Actualmente, el desarrollo principal se ha migrado a TypeScript con una arquitectura renovada en la rama `main`. Esta rama (`legacy-v1`) se conserva intacta como demostración de la primera iteración funcional del sistema.

---

## Tecnologías Utilizadas (v1)

- **Entorno:** Node.js
- **Lenguaje:** JavaScript
- **Framework Web:** Express.js
- **Base de Datos:** MySQL
- **ORM:** Sequelize
- **Documentación:** Swagger UI
- **Integraciones:** Cloudinary (manejo de imágenes)
- **Utilidades:** CORS, Morgan (logger), Dotenv

---

## Estructura de Rutas Principal

La API está dividida en los siguientes módulos principales, documentados interactivamente a través de Swagger:

- `/api/auth` - Autenticación y registro de usuarios
- `/api/users` - Gestión de perfiles de alumnos
- `/api/products` - Catálogo de productos y publicaciones
- `/api/categories` - Categorías del marketplace
- `/api/orders` - Gestión de pedidos e intercambios
- `/api/messages` - Chat entre comprador y vendedor
- `/api/favorites` - Lista de deseos de los usuarios
- `/api/notifications` - Sistema de alertas
- `/api/cloudinary` - Gestión de carga de imágenes

---

## Cómo ejecutar esta versión en local

Para correr esta versión *Legacy* en un entorno de desarrollo, sigue estos pasos cuidadosamente:

### 1. Clonar el repositorio y cambiar a la rama Legacy

git clone [https://github.com/Juanclbici/cutcitos_backend.git](https://github.com/Juanclbici/cutcitos_backend.git)
cd cutcitos_backend
git checkout legacy-v1

### 2. Instalar dependencias
npm install

### 3. Preparar la Base de Datos (MySQL)
Este proyecto utiliza Sequelize para crear las tablas automáticamente, pero la base de datos debe existir previamente. Abre tu gestor de MySQL (terminal, phpMyAdmin, MySQL Workbench) y ejecuta:

SQL
CREATE DATABASE cutcitos_development;

### 4. Variables de Entorno
Crea un archivo llamado .env en la raíz del proyecto. Aquí tienes la plantilla basada en la configuración del sistema:

### Configuración del Servidor
PORT=3000
FRONTEND_URL=http://localhost:3000

### Configuración de Base de Datos (MySQL)
DB_HOST=127.0.0.1 o localhost
DB_USER=root
DB_PASSWORD=tu_contrasena_de_mysql
DB_NAME=cutcitos_development

### Configuración de JWT 
JWT_SECRET=tu_secreto_super_seguro

### Configuración de Cloudinary (Para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

### 5. Iniciar el Servidor
Una vez configurado el .env y creada la base de datos vacía, levanta el proyecto. Sequelize detectará la base de datos y creará todas las tablas en español automáticamente:

Bash
npm start
### O para desarrollo con recarga automática: npm run dev
6. Documentación
Una vez que el servidor esté corriendo, puedes ver y probar todos los endpoints visitando la interfaz de Swagger en tu navegador:
http://localhost:3000/api-docs

Desarrollado para la comunidad de la UDG.
