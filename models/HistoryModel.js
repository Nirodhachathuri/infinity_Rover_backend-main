import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const History = db.define('history',{
    userId:{
        type: DataTypes.INTEGER
    },
    amount:{
        type: DataTypes.FLOAT
    },
    balanceIncreased:{
        type: DataTypes.BOOLEAN
    },
    type:{
        type: DataTypes.STRING
    },
    
},{
    freezeTableName:true
});

export default History;