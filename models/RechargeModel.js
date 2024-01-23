import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Rechge = db.define(
  "recharges",
  {
    username: {
      type: DataTypes.STRING,
    },
    hash: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.STRING,
    },
    imagePath: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Rechge;
