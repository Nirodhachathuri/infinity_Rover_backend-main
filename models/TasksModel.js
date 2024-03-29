import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Tasks = db.define('tasks',{
    username:{
        type: DataTypes.STRING
    },
    level:{
        type: DataTypes.STRING
    },
    amountTask:{
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.STRING
    },
    updatedAt:{
        type: DataTypes.STRING
    }
        
},{
    freezeTableName:true
});

export default Tasks;
