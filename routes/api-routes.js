const Router = require('express')
const api_router = new Router()

const auth = require('./controllers/authorization-controller')
const user = require('./controllers/user-controller')

api_router.get('/user', user.getUserInfo)

module.exports = api_router