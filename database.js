require('dotenv').config()
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.user,
    password: process.env.password,
    host: process.env.host,
    port: process.env.port,
    database: process.env.database
})
module.exports = pool;
// const {Sequelize} = require('sequelize')
// const sequelize = new Sequelize(process.env.database, process.env.user, process.env.password, {
//     dialect: 'postgres',
//     host: process.env.host,
//     port: process.env.port
// })
//
// sequelize
//     .authenticate()
//     .then(() => {
//         console.log('Connection has been established successfully.');
//     })
//     .catch(err => {
//         console.error('Unable to connect to the database:', err);
//     });
//
// module.exports = sequelize
