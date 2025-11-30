const crypto = require("crypto");
const { BlockchainBlock } = require("../models");
const db = require("../models"); 

/**
 * Calcula el hash SHA-256 de un bloque blockchain
 * @param {Object} blockData - Datos del bloque para calcular hash
 * @param {number} blockData.index - Índice del bloque en la cadena
 * @param {number} blockData.timestamp - Marca de tiempo en milisegundos
 * @param {Object} blockData.data - Datos contenidos en el bloque
 * @param {string} blockData.previous_hash - Hash del bloque anterior
 * @returns {string} Hash SHA-256 calculado
 */
function computeHash({ index, timestamp, data, previous_hash }) {
  // Normalizar todos los datos para garantizar consistencia en el cálculo
  const normalizedData = {
    index: Number(index),                    // Asegurar que sea número
    timestamp: Number(timestamp),            // Asegurar que sea número
    data: JSON.parse(JSON.stringify(data)),  // Deep clone para eliminar metadatos
    previous_hash: String(previous_hash)     // Asegurar que sea string
  };
  
  // Crear string consistente usando separador explícito
  const hashString = [
    normalizedData.index,
    normalizedData.timestamp,
    JSON.stringify(normalizedData.data, Object.keys(normalizedData.data).sort()), // Ordenar propiedades
    normalizedData.previous_hash
  ].join('|');  // Separador explícito para evitar ambigüedades
  
  // Calcular y retornar hash SHA-256
  return crypto
    .createHash("sha256")
    .update(hashString)
    .digest("hex");
}

/**
 * Crea el bloque génesis si la cadena está vacía
 * El bloque génesis es el primer bloque (índice 0) con prev_hash = "0"
 * @returns {Promise<void>}
 */
async function createGenesisBlockIfNeeded() {
  const count = await BlockchainBlock.count();
  if (count === 0) {
    console.log("Creando bloque génesis...");
    const genesisData = {
      index: 0,
      timestamp: Date.now(),
      data: { message: "GENESIS_BLOCK" },
      previous_hash: "0"
    };
    
    const hash = computeHash(genesisData);
    
    try {
      await BlockchainBlock.create({
        block_index: 0,
        timestamp: genesisData.timestamp,
        data: genesisData.data,
        prev_hash: "0",
        hash: hash
      });
      console.log("Bloque génesis creado exitosamente");
    } catch (error) {
      console.error("Error creando bloque génesis:", error);
      throw error;
    }
  }
}

/**
 * Agrega un nuevo registro (bloque) al final de la cadena blockchain
 * @param {Object} data - Datos a almacenar en el bloque
 * @returns {Promise<Object>} Nuevo bloque creado
 */
exports.addRecord = async (data) => {
  try {
    // Asegurar que existe el bloque génesis antes de agregar nuevos bloques
    await createGenesisBlockIfNeeded();

    // Obtener el último bloque de la cadena para enlazar
    const previous = await BlockchainBlock.findOne({
      order: [["block_index", "DESC"]],
    });

    // Calcular índice y hash anterior
    const index = previous ? previous.block_index + 1 : 0;
    const previous_hash = previous ? previous.hash : "0";
    const timestamp = Date.now();

    const blockData = {
      index,
      timestamp,
      data,
      previous_hash,
    };

    // Calcular hash del nuevo bloque
    const hash = computeHash(blockData);

    console.log("Creando nuevo bloque con:", {
      block_index: index,
      timestamp,
      data,
      prev_hash: previous_hash,
      hash
    });

    // Crear y guardar el nuevo bloque en la base de datos
    const newBlock = await BlockchainBlock.create({
      block_index: index,
      timestamp,
      data: data,
      prev_hash: previous_hash,
      hash,
    });

    console.log("Bloque creado exitosamente:", newBlock.block_index);
    return newBlock;

  } catch (error) {
    console.error("Error en addRecord:", error);
    throw error;
  }
};

/**
 * Obtiene todos los bloques de la cadena en orden ascendente
 * @returns {Promise<Object>} Objeto con total de bloques y registros
 */
exports.getBlockchainRecords = async () => {
  const records = await BlockchainBlock.findAll({
    order: [["block_index", "ASC"]],  // Ordenar por índice ascendente
  });

  return {
    totalBlocks: records.length,
    records,
  };
};

/**
 * Verifica la integridad completa de la cadena blockchain
 * Realiza las siguientes comprobaciones:
 * - Recalcula el hash de cada bloque y lo compara con el almacenado
 * - Verifica que cada bloque enlace correctamente con el anterior
 * - Detecta y clasifica múltiples tipos de errores
 * @returns {Promise<Object>} Resultado de la verificación con detalles de errores
 */
exports.verifyChain = async () => {
  const blocks = await BlockchainBlock.findAll({
    order: [["block_index", "ASC"]],
  });

  // Cadena vacía se considera válida
  if (blocks.length === 0) {
    return { valid: true, message: "La cadena está vacía pero intacta." };
  }

  const errors = [];
  let chainBrokenAt = null;  // Punto donde se rompió la cadena

  // Verificar bloque génesis (debe ser índice 0 con prev_hash = "0")
  const genesis = blocks[0];
  if (genesis.block_index !== 0 || genesis.prev_hash !== "0") {
    errors.push({
      blockIndex: 0,
      type: "GENESIS_CORRUPT",
      message: "Bloque génesis inválido - Estructura comprometida desde el inicio",
      severity: "CRITICAL"
    });
    chainBrokenAt = 0;
  }

  // Verificar cada bloque de la cadena
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Si la cadena ya está rota, marcar bloques siguientes como víctimas
    if (chainBrokenAt !== null && i > chainBrokenAt) {
      errors.push({
        blockIndex: block.block_index,
        type: "CHAIN_VICTIM",
        message: `Bloque afectado por corrupción en bloque ${chainBrokenAt}`,
        severity: "MEDIUM"
      });
      continue;  // Saltar verificación detallada de bloques afectados
    }

    // Recalcular hash del bloque actual para verificar integridad
    const recalculated = computeHash({
      index: block.block_index,
      timestamp: block.timestamp,
      data: block.data,
      previous_hash: block.prev_hash,
    });

    // Verificar si el bloque fue alterado (hash no coincide)
    const isBlockAltered = recalculated !== block.hash;
    
    // Verificar enlace con bloque anterior (excepto para génesis)
    let isLinkBroken = false;
    if (i > 0) {
      const previous = blocks[i - 1];
      
      // Recalcular hash del bloque anterior para verificar su integridad primero
      const previousRecalculated = computeHash({
        index: previous.block_index,
        timestamp: previous.timestamp,
        data: previous.data,
        previous_hash: previous.prev_hash,
      });
      
      const previousIsValid = previousRecalculated === previous.hash;
      
      if (!previousIsValid) {
        // El bloque anterior está corrupto
        isLinkBroken = true;
        if (chainBrokenAt === null) {
          chainBrokenAt = i - 1;  // Marcar punto de ruptura
        }
      } else if (block.prev_hash !== previous.hash) {
        // El enlace está roto pero el bloque anterior es válido
        isLinkBroken = true;
        if (chainBrokenAt === null) {
          chainBrokenAt = i;  // Marcar punto de ruptura
        }
      }
    }

    // Registrar errores específicos según el tipo de problema
    if (isBlockAltered) {
      errors.push({
        blockIndex: block.block_index,
        type: "DATA_CORRUPTED",
        message: "Los datos de este bloque fueron alterados directamente",
        severity: "CRITICAL"
      });
      if (chainBrokenAt === null) {
        chainBrokenAt = i;
      }
    }

    if (isLinkBroken && !isBlockAltered) {
      errors.push({
        blockIndex: block.block_index,
        type: "LINK_BROKEN",
        message: `Enlace roto con bloque anterior debido a corrupción previa`,
        severity: "HIGH"
      });
    }
  }

  // Contar y clasificar errores para el resumen
  const criticalErrors = errors.filter(e => e.severity === "CRITICAL").length;
  const victimErrors = errors.filter(e => e.type === "CHAIN_VICTIM").length;

  return {
    valid: errors.length === 0,
    message: errors.length === 0 ? 
      "La cadena es válida." : 
      `Cadena comprometida: ${criticalErrors} bloques alterados + ${victimErrors} bloques afectados`,
    summary: {
      totalBlocks: blocks.length,
      directlyCorrupted: criticalErrors,
      indirectlyAffected: victimErrors,
      chainBreakPoint: chainBrokenAt
    },
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Repara la cadena blockchain recalculando hashes desde un bloque específico
 * Útil cuando se detecta corrupción y se necesita reconstruir la cadena
 * @param {number} startBlockIndex - Índice del bloque desde donde comenzar la reparación
 * @returns {Promise<Object>} Resultado de la reparación con detalles
 */
exports.repairChainFromBlock = async (startBlockIndex) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const blocks = await BlockchainBlock.findAll({
      order: [["block_index", "ASC"]],
      transaction
    });

    // No hay bloques que reparar
    if (blocks.length === 0) {
      await transaction.commit();
      return { 
        success: true, 
        message: "No hay bloques que reparar - cadena vacía" 
      };
    }

    // Validar que el índice de inicio existe
    if (startBlockIndex >= blocks.length) {
      await transaction.commit();
      return {
        success: false,
        error: `startBlockIndex ${startBlockIndex} excede el número de bloques (${blocks.length})`
      };
    }

    let repairedBlocks = 0;
    const repairDetails = [];

    // Reconstruir hashes desde el bloque startBlockIndex hacia adelante
    for (let i = startBlockIndex; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Determinar el prev_hash correcto
      let previous_hash;
      if (i === 0) {
        previous_hash = "0";  // Génesis siempre apunta a "0"
      } else {
        const previousBlock = blocks[i - 1];
        previous_hash = previousBlock.hash;  // Usar hash recalculado del bloque anterior
      }

      // Recalcular hash del bloque actual con datos normalizados
      const newHash = computeHash({
        index: block.block_index,
        timestamp: block.timestamp,
        data: block.data,
        previous_hash: previous_hash
      });

      // Verificar si el bloque necesita reparación
      const needsHashRepair = newHash !== block.hash;
      const needsPrevHashRepair = block.prev_hash !== previous_hash;

      // Aplicar reparaciones necesarias
      if (needsHashRepair || needsPrevHashRepair) {
        const updateData = {};
        
        if (needsHashRepair) {
          updateData.hash = newHash;  // Actualizar hash calculado
        }
        if (needsPrevHashRepair) {
          updateData.prev_hash = previous_hash;  // Corregir enlace anterior
        }

        await block.update(updateData, { transaction });
        
        repairedBlocks++;
        repairDetails.push({
          blockIndex: block.block_index,
          hashRepaired: needsHashRepair,
          prevHashRepaired: needsPrevHashRepair,
          newHash: newHash.substring(0, 16) + "..."  // Hash truncado para logging
        });

        console.log(`Bloque ${block.block_index} reparado. Hash: ${needsHashRepair ? 'SÍ' : 'NO'}, PrevHash: ${needsPrevHashRepair ? 'SÍ' : 'NO'}`);
      }
    }

    await transaction.commit();
    
    return {
      success: true,
      message: `Cadena reparada exitosamente desde bloque ${startBlockIndex}`,
      repairedBlocks: repairedBlocks,
      details: repairDetails,
      finalBlockCount: blocks.length
    };

  } catch (error) {
    await transaction.rollback();
    console.error("Error reparando cadena:", error);
    return {
      success: false,
      error: "Error al reparar la cadena: " + error.message
    };
  }
};