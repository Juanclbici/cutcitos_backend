const blockchainService = require("../../services/blockchainService");
const logger = require("../../utils/logger");

exports.addRecord = async (req, res) => {
  try {
    const block = await blockchainService.addRecord(req.body);
    res.status(201).json({ success: true, block });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBlockchainRecords = async (req, res) => {
  try {
    const result = await blockchainService.getBlockchainRecords();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyChain = async (req, res) => {
  try {
    const result = await blockchainService.verifyChain();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- 4. Reparar cadena ---
exports.repairChain = async (req, res) => {
  try {
    const { startBlockIndex = 0 } = req.body;
    
    // Validar que startBlockIndex sea un número válido
    const startIndex = parseInt(startBlockIndex);
    if (isNaN(startIndex) || startIndex < 0) {
      return res.status(400).json({
        success: false,
        error: "startBlockIndex debe ser un número mayor o igual a 0"
      });
    }

    const result = await blockchainService.repairChainFromBlock(startIndex);
    
    if (result.success) {
      logger.info(`Cadena blockchain reparada desde bloque ${startIndex}. Bloques afectados: ${result.repairedBlocks}`);
      res.status(200).json(result);
    } else {
      logger.error(`Error al reparar cadena: ${result.error}`);
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error(`Error en repairChain: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
