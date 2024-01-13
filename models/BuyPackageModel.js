import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const BuyPackages = db.define('buypackages',{
    packageId:{
        type: DataTypes.INTEGER
    },
    userId:{
        type: DataTypes.INTEGER
    }
    
},{
    freezeTableName:true
});

export default BuyPackages;