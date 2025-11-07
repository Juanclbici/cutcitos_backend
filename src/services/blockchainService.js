// services/blockchainService.js
const { ethers } = require("ethers");
require('dotenv').config();

//URL
const URL = process.env.URL_CHAIN;

// Conectarse a Ganache (debes tenerlo corriendo con `ganache`)
const provider = new ethers.JsonRpcProvider(URL);

// Usa una de las claves privadas que te dio Ganache (la #0 por ejemplo)
const privateKey = process.env.privateKey;
const wallet = new ethers.Wallet(privateKey, provider);

// Función para registrar una transacción de pedido en blockchain
async function logOrderOnBlockchain(action, order) {
  try {
    const message = `[${action.toUpperCase()}] Pedido ${order.pedido_id} | Usuario: ${order.usuario_id} | Vendedor: ${order.vendedor_id} | Total: ${order.total} | Estado: ${order.estado_pedido}`;

    // Enviamos una transacción vacía con el mensaje en los datos
    const tx = await wallet.sendTransaction({
      to: wallet.address, // transacción a sí mismo (sin mover ETH)
      value: 0,
      data: ethers.toUtf8Bytes(message)
    });

    console.log(`✅ ${action} registrado en blockchain: ${tx.hash}`);
    return tx.hash;
  } catch (err) {
    console.error("❌ Error registrando en blockchain:", err.message);
    return null;
  }
}

module.exports = { logOrderOnBlockchain };
