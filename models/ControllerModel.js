import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Control = db.define('controls',{
    name:{
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.STRING
    }
    
},{
    freezeTableName:true
});

export default Control;
