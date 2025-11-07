const { ethers } = require("ethers");
const logger = require("../utils/logger");
require("dotenv").config();

// URL de la red (Ganache local)
const URL = process.env.URL_CHAIN;
const provider = new ethers.JsonRpcProvider(URL);

// Clave privada (cuenta 0 de Ganache)
const privateKey = process.env.privateKey;
const wallet = new ethers.Wallet(privateKey, provider);

/**
 * Registrar transacción de pedido en blockchain
 * Guarda una transacción con el mensaje de acción (crear, cancelar, entregar, etc.)
 */
async function logOrderOnBlockchain(action, order) {
  try {
    const message = `[${action.toUpperCase()}] Pedido ${order.pedido_id} | Usuario: ${order.usuario_id} | Vendedor: ${order.vendedor_id} | Total: ${order.total} | Estado: ${order.estado_pedido}`;

    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0,
      data: ethers.toUtf8Bytes(message),
    });

    logger.info(`${action} registrado en blockchain: ${tx.hash}`);
    return tx.hash;
  } catch (err) {
    logger.error(`Error registrando en blockchain: ${err.message}`);
    return null;
  }
}

/**
 * Consultar todos los registros en blockchain
 * Lee todos los bloques y decodifica los mensajes de texto guardados
 */
async function getBlockchainRecords() {
  try {
    const latestBlock = await provider.getBlockNumber();
    const records = [];

    for (let i = 1; i <= latestBlock; i++) {
      const block = await provider.getBlock(i);
      if (!block.transactions || block.transactions.length === 0) continue;

      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (tx && tx.data && tx.data !== "0x") {
          let message;
          try {
            message = ethers.toUtf8String(tx.data);
          } catch {
            message = "(no se pudo decodificar)";
          }

          records.push({
            blockNumber: i,
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            message,
          });
        }
      }
    }

    logger.info(`Se consultaron ${records.length} registros de blockchain`);
    return {
      totalBlocks: latestBlock,
      totalRecords: records.length,
      records,
    };
  } catch (error) {
    logger.error(`Error al obtener registros blockchain: ${error.message}`);
    throw error;
  }
}


module.exports = { logOrderOnBlockchain, getBlockchainRecords };

