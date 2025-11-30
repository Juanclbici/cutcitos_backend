const express = require("express");
const router = express.Router();
const blockchainController = require("../controllers/productControllers/blockchainController.js");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     BlockchainBlock:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del bloque
 *         block_index:
 *           type: integer
 *           description: Índice del bloque en la cadena
 *         timestamp:
 *           type: integer
 *           description: Marca de tiempo en milisegundos
 *         data:
 *           type: object
 *           description: Datos almacenados en el bloque
 *         prev_hash:
 *           type: string
 *           description: Hash del bloque anterior
 *         hash:
 *           type: string
 *           description: Hash del bloque actual
 *     NewBlockRequest:
 *       type: object
 *       required:
 *         - data
 *       properties:
 *         data:
 *           type: object
 *           description: Datos a almacenar en el bloque
 *           example:
 *             action: "CREAR_PEDIDO"
 *             order_id: 55
 *             user_id: 3
 *     ChainVerification:
 *       type: object
 *       properties:
 *         valid:
 *           type: boolean
 *           description: Indica si la cadena es válida
 *         message:
 *           type: string
 *           description: Mensaje descriptivo
 *         error:
 *           type: string
 *           description: Descripción del error (si existe)
 *     BlockchainResponse:
 *       type: object
 *       properties:
 *         totalBlocks:
 *           type: integer
 *           description: Número total de bloques
 *         records:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlockchainBlock'
 */

/**
 * @swagger
 * tags:
 *   name: Blockchain
 *   description: Endpoints para gestión de la cadena de bloques
 */

/**
 * @swagger
 * /blockchain/add:
 *   post:
 *     summary: Agrega un nuevo registro al final de la cadena
 *     description: Crea un nuevo bloque con los datos proporcionados y lo añade al final de la cadena blockchain
 *     tags: [Blockchain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBlockRequest'
 *           example:
 *             data:
 *               action: "CREAR_PEDIDO"
 *               order_id: 55
 *               user_id: 3
 *               vendor_id: 2
 *               total: 150.50
 *               estado: "pendiente"
 *     responses:
 *       201:
 *         description: Bloque creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 block:
 *                   $ref: '#/components/schemas/BlockchainBlock'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post("/add", blockchainController.addRecord);

/**
 * @swagger
 * /blockchain/records:
 *   get:
 *     summary: Mostrar todos los registros en orden, incluyendo sus hashes
 *     description: Retorna todos los bloques de la cadena en orden ascendente por índice, mostrando todos los detalles incluyendo los hashes
 *     tags: [Blockchain]
 *     responses:
 *       200:
 *         description: Lista de todos los bloques de la cadena
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlockchainResponse'
 *             example:
 *               totalBlocks: 2
 *               records:
 *                 - id: 1
 *                   block_index: 0
 *                   timestamp: 1732924897412
 *                   data: 
 *                     message: "GENESIS_BLOCK"
 *                   prev_hash: "0"
 *                   hash: "5d1571d8120bd6f3622ac832f50db6d15db9468d713b276f465d99735c5a7aae"
 *                 - id: 2
 *                   block_index: 1
 *                   timestamp: 1732924897450
 *                   data:
 *                     action: "CREAR_PEDIDO"
 *                     order_id: 55
 *                     user_id: 3
 *                   prev_hash: "5d1571d8120bd6f3622ac832f50db6d15db9468d713b276f465d99735c5a7aae"
 *                   hash: "5dfc80165d15c01c7a0ff089470456f47c7acae5414c6d70cac0763de9b1fea4"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/records", blockchainController.getBlockchainRecords);

/**
 * @swagger
 * /blockchain/verify:
 *   get:
 *     summary: Verificar la integridad de la cadena
 *     description: |
 *       Verifica la integridad completa de la cadena blockchain realizando las siguientes comprobaciones:
 *       - Recorre todos los registros
 *       - Recalcula el hash de cada uno
 *       - Compara el hash recalculado con el almacenado
 *       - Verifica que el prev_hash de cada registro coincida con el hash_actual del anterior
 *       - Reporta si la cadena es válida o si se detectó una alteración
 *     tags: [Blockchain]
 *     responses:
 *       200:
 *         description: Resultado de la verificación de integridad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChainVerification'
 *             examples:
 *               validChain:
 *                 summary: Cadena válida
 *                 value:
 *                   valid: true
 *                   message: "La cadena es válida."
 *               invalidChain:
 *                 summary: Cadena alterada
 *                 value:
 *                   valid: false
 *                   error: "El bloque 2 fue alterado (hash incorrecto)."
 *       500:
 *         description: Error interno del servidor
 */
router.get("/verify", blockchainController.verifyChain);

/**
 * @swagger
 * /blockchain/repair:
 *   post:
 *     summary: Repara la cadena blockchain desde un bloque específico
 *     description: |
 *       Recalcula y corrige los hashes de la cadena desde el bloque especificado.
 *       Útil cuando se detecta corrupción en la cadena.
 *     tags: [Blockchain]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startBlockIndex:
 *                 type: integer
 *                 description: Índice del bloque desde donde comenzar la reparación (0 para reparar toda la cadena)
 *                 example: 0
 *                 default: 0
 *     responses:
 *       200:
 *         description: Cadena reparada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 repairedBlocks:
 *                   type: integer
 *                   description: Número de bloques reparados
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       blockIndex:
 *                         type: integer
 *                       hashRepaired:
 *                         type: boolean
 *                       prevHashRepaired:
 *                         type: boolean
 *                       newHash:
 *                         type: string
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
router.post("/repair", blockchainController.repairChain);

module.exports = router;