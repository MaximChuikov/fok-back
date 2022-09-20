const Router = require('express')
const api_router = new Router()

const user_router = require('./user')
const manager_router = require('./manager')

api_router.use('/user', user_router)
//api_router.use('/manager', manager_router)

module.exports = api_router