const blockchainService = require("../../services/blockchainService");
const logger = require("../../utils/logger");

/**
 * Controlador para agregar un nuevo registro a la blockchain
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos a almacenar en el nuevo bloque
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>}
 */
exports.addRecord = async (req, res) => {
  try {
    // Llamar al servicio para crear un nuevo bloque con los datos recibidos
    const block = await blockchainService.addRecord(req.body);
    
    // Retornar éxito 201 (Created) con el bloque creado
    res.status(201).json({ 
      success: true, 
      block 
    });
  } catch (error) {
    // Error interno del servidor
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Controlador para obtener todos los registros de la blockchain
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>}
 */
exports.getBlockchainRecords = async (req, res) => {
  try {
    // Obtener todos los bloques de la cadena en orden
    const result = await blockchainService.getBlockchainRecords();
    
    // Retornar éxito 200 (OK) con el resultado
    res.status(200).json(result);
  } catch (error) {
    // Error interno del servidor
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Controlador para verificar la integridad de la cadena blockchain
 * Realiza validación completa de hashes y enlaces entre bloques
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>}
 */
exports.verifyChain = async (req, res) => {
  try {
    // Ejecutar verificación completa de la cadena
    const result = await blockchainService.verifyChain();
    
    // Retornar resultado de la verificación
    res.status(200).json(result);
  } catch (error) {
    // Error interno del servidor durante la verificación
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Controlador para reparar la cadena blockchain desde un bloque específico
 * Recalcula hashes y corrige enlaces rotos en la cadena
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos de la solicitud
 * @param {number} [req.body.startBlockIndex=0] - Índice del bloque desde donde comenzar la reparación
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>}
 */
exports.repairChain = async (req, res) => {
  try {
    // Obtener y validar el índice de inicio para la reparación
    const { startBlockIndex = 0 } = req.body;
    const startIndex = parseInt(startBlockIndex);
    
    // Validar que el startBlockIndex sea un número válido
    if (isNaN(startIndex) || startIndex < 0) {
      return res.status(400).json({
        success: false,
        error: "startBlockIndex debe ser un número mayor o igual a 0"
      });
    }

    // Ejecutar el proceso de reparación
    const result = await blockchainService.repairChainFromBlock(startIndex);
    
    // Manejar respuesta según el resultado de la reparación
    if (result.success) {
      // Reparación exitosa - registrar en logs y retornar resultado
      logger.info(`Cadena blockchain reparada desde bloque ${startIndex}. Bloques afectados: ${result.repairedBlocks}`);
      res.status(200).json(result);
    } else {
      // Error en la reparación - registrar y retornar error
      logger.error(`Error al reparar cadena: ${result.error}`);
      res.status(400).json(result);
    }
  } catch (error) {
    // Error inesperado durante el proceso de reparación
    logger.error(`Error en repairChain: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};