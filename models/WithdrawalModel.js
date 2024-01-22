import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Widraw = db.define('withdrawals',{
    username:{
        type: DataTypes.STRING
    },
    to:{
        type: DataTypes.STRING
    },
    amount:{
        type: DataTypes.STRING
    },
    userId: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
  
    
},{
    freezeTableName:true
});

export default Widraw;
