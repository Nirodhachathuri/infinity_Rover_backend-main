import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const ControlPanel = db.define('controlpanel',{
    make_deposits:{
        type: DataTypes.BOOLEAN
    },
    make_withdrawals:{
        type: DataTypes.BOOLEAN
    },
    packages_purchase:{
        type: DataTypes.BOOLEAN
    }
    
},{
    freezeTableName:true
});

export default ControlPanel;
