module.exports = (sequelize, DataTypes) => {
  const BlockchainBlock = sequelize.define("BlockchainBlock", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    block_index: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false
    },
    prev_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: "blockchain_blocks",
    timestamps: false,
    underscored: true
  });

  return BlockchainBlock;
};
