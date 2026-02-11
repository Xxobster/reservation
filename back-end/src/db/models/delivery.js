"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    static associate() {}
  }
  Delivery.init(
    {
      guesthouse: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      roomNumber: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      deliveredAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      feeGuesthouseLAK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lat: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      lng: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      customerName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      customerPhone: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "delivery",
      tableName: "Deliveries",
      freezeTableName: true,
    }
  );
  return Delivery;
};
