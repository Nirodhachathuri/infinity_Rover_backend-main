import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Packages = db.define('packages',{
    packageName:{
        type: DataTypes.STRING
    },
    packageValue:{
        type: DataTypes.FLOAT
    },
    buyCount:{
        type: DataTypes.MEDIUMINT
    }
    
},{
    freezeTableName:true
});

export default Packages;