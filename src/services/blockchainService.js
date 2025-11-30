const crypto = require("crypto");
const { BlockchainBlock } = require("../models");
const db = require("../models"); 

// Función para calcular hash
function computeHash({ index, timestamp, data, previous_hash }) {
  // Normalizar todos los datos
  const normalizedData = {
    index: Number(index),
    timestamp: Number(timestamp),
    data: JSON.parse(JSON.stringify(data)),
    previous_hash: String(previous_hash)
  };
  
  // Crear string consistente
  const hashString = [
    normalizedData.index,
    normalizedData.timestamp,
    JSON.stringify(normalizedData.data, Object.keys(normalizedData.data).sort()),
    normalizedData.previous_hash
  ].join('|');
  
  return crypto
    .createHash("sha256")
    .update(hashString)
    .digest("hex");
}

// Función para crear bloque génesis
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

// Agregar nuevo bloque
exports.addRecord = async (data) => {
  try {
    // Asegurar que existe el bloque génesis
    await createGenesisBlockIfNeeded();

    // Obtener último bloque
    const previous = await BlockchainBlock.findOne({
      order: [["block_index", "DESC"]],
    });

    const index = previous ? previous.block_index + 1 : 0;
    const previous_hash = previous ? previous.hash : "0";
    const timestamp = Date.now();

    const blockData = {
      index,
      timestamp,
      data,
      previous_hash,
    };

    const hash = computeHash(blockData);

    console.log("Creando nuevo bloque con:", {
      block_index: index,
      timestamp,
      data,
      prev_hash: previous_hash,
      hash
    });

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

// Obtener todos los bloques
exports.getBlockchainRecords = async () => {
  const records = await BlockchainBlock.findAll({
    order: [["block_index", "ASC"]],
  });

  return {
    totalBlocks: records.length,
    records,
  };
};

// Verificar integridad (DETECTA MÚLTIPLES ERRORES)
exports.verifyChain = async () => {
  const blocks = await BlockchainBlock.findAll({
    order: [["block_index", "ASC"]],
  });

  if (blocks.length === 0) {
    return { valid: true, message: "La cadena está vacía pero intacta." };
  }

  const errors = [];
  let chainBrokenAt = null;

  // Verificar bloque génesis
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

  // Verificar cada bloque
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Si la cadena ya está rota, los bloques siguientes son víctimas
    if (chainBrokenAt !== null && i > chainBrokenAt) {
      errors.push({
        blockIndex: block.block_index,
        type: "CHAIN_VICTIM",
        message: `Bloque afectado por corrupción en bloque ${chainBrokenAt}`,
        severity: "MEDIUM"
      });
      continue;
    }

    // Recalcular hash del bloque actual
    const recalculated = computeHash({
      index: block.block_index,
      timestamp: block.timestamp,
      data: block.data,
      previous_hash: block.prev_hash,
    });

    // Verificar si el bloque mismo fue alterado
    const isBlockAltered = recalculated !== block.hash;
    
    // Verificar enlace con anterior (excepto génesis)
    let isLinkBroken = false;
    if (i > 0) {
      const previous = blocks[i - 1];
      
      // Recalcular hash del bloque anterior para verificar su integridad
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
          chainBrokenAt = i - 1;
        }
      } else if (block.prev_hash !== previous.hash) {
        // El enlace está roto pero el anterior es válido
        isLinkBroken = true;
        if (chainBrokenAt === null) {
          chainBrokenAt = i;
        }
      }
    }

    // Registrar errores específicos
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

  // Contar tipos de errores
  const criticalErrors = errors.filter(e => e.severity === "CRITICAL").length;
  const victimErrors = errors.filter(e => e.type === "CHAIN_VICTIM").length;

  return {
    valid: errors.length === 0,
    message: errors.length === 0 ? "La cadena es válida." : `Cadena comprometida: ${criticalErrors} bloques alterados + ${victimErrors} bloques afectados`,
    summary: {
      totalBlocks: blocks.length,
      directlyCorrupted: criticalErrors,
      indirectlyAffected: victimErrors,
      chainBreakPoint: chainBrokenAt
    },
    errors: errors.length > 0 ? errors : undefined
  };
};

// Reparar cadena desde un bloque específico
exports.repairChainFromBlock = async (startBlockIndex) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const blocks = await BlockchainBlock.findAll({
      order: [["block_index", "ASC"]],
      transaction
    });

    if (blocks.length === 0) {
      await transaction.commit();
      return { 
        success: true, 
        message: "No hay bloques que reparar - cadena vacía" 
      };
    }

    // Validar que el startBlockIndex existe
    if (startBlockIndex >= blocks.length) {
      await transaction.commit();
      return {
        success: false,
        error: `startBlockIndex ${startBlockIndex} excede el número de bloques (${blocks.length})`
      };
    }

    let repairedBlocks = 0;
    const repairDetails = [];

    // Reconstruir hashes desde el bloque startBlockIndex
    for (let i = startBlockIndex; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Determinar el prev_hash correcto
      let previous_hash;
      if (i === 0) {
        previous_hash = "0"; 
      } else {
        const previousBlock = blocks[i - 1];
        previous_hash = previousBlock.hash; // Usar el hash RECIÉN CALCULADO del bloque anterior
      }

      // Recalcular hash del bloque actual
      const newHash = computeHash({
        index: block.block_index,
        timestamp: block.timestamp,
        data: block.data,
        previous_hash: previous_hash
      });

      // Verificar si necesita reparación
      const needsHashRepair = newHash !== block.hash;
      const needsPrevHashRepair = block.prev_hash !== previous_hash;

      if (needsHashRepair || needsPrevHashRepair) {
        const updateData = {};
        
        if (needsHashRepair) {
          updateData.hash = newHash;
        }
        if (needsPrevHashRepair) {
          updateData.prev_hash = previous_hash;
        }

        await block.update(updateData, { transaction });
        
        repairedBlocks++;
        repairDetails.push({
          blockIndex: block.block_index,
          hashRepaired: needsHashRepair,
          prevHashRepaired: needsPrevHashRepair,
          newHash: newHash.substring(0, 16) + "..."
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