import {Sequelize} from "sequelize";
const db = new
Sequelize('gamification_123','gamification_123','12345678',{
    host: "db4free.net",
    dialect: "mysql"
});

export default db;
