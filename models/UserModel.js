import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Users = db.define(
  "users",
  {
    username: {
      type: DataTypes.STRING,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    mobile: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
    balance: {
      type: DataTypes.INTEGER,
    },
    vip: {
      type: DataTypes.INTEGER,
    },
    levelTime: {
      type: DataTypes.INTEGER,
    },
    daily: {
      type: DataTypes.INTEGER,
    },
    ref_code: {
      type: DataTypes.STRING,
    },
    user_code: {
      type: DataTypes.STRING,
    },
    ipv4: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    position: {
      type: DataTypes.STRING,
    },
    nicNo: {
      type: DataTypes.STRING,
    },
    nicImage: {
      type: DataTypes.STRING,
    },
    wallet: {
      type: DataTypes.STRING,
    },
   
    kycApproved: {
      type: DataTypes.BOOLEAN,
    },
    acc_banned: {
      type: DataTypes.BOOLEAN,
    },
    isAssigned: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Users;
