const blockchainService = require("../../services/blockchainService");
const logger = require("../../utils/logger");

exports.getBlockchainRecords = async (req, res) => {
  try {
    const result = await blockchainService.getBlockchainRecords();
    logger.info("Registros de blockchain obtenidos correctamente");

    res.status(200).json({
      success: true,
      totalBlocks: result.totalBlocks,
      totalRecords: result.totalRecords,
      records: result.records,
    });
  } catch (error) {
    logger.error(`Error en getBlockchainRecords: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error al consultar blockchain",
    });
  }
};

