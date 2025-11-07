const express = require("express");
const router = express.Router();
const blockchainController = require("../controllers/productControllers/blockchainController.js");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Blockchain
 *   description: Endpoints para consultar registros almacenados en la blockchain local (Ganache)
 */

/**
 * @swagger
 * /blockchain/records:
 *   get:
 *     summary: Obtener todos los registros almacenados en la blockchain
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros obtenidos desde la blockchain
 *       500:
 *         description: Error al consultar blockchain
 */
router.use(authMiddleware.verifyToken);
router.get("/records", blockchainController.getBlockchainRecords);

module.exports = router;
