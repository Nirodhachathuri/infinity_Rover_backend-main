import {Sequelize} from "sequelize";

const db = new Sequelize('new_test_db','root','password',{
// const db = new Sequelize('new_test_db','root','',{
    host: "localhost",
    dialect: "mysql"
});

export default db;
