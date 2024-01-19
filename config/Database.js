import {Sequelize} from "sequelize";
const db = new
Sequelize('mydatabase','root','My@12345',{
    host: "162.0.228.109",
    dialect: "mysql"
});

export default db;
