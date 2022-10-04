const Router = require('express')
const api_router = new Router()

const user_router = require('./user')
const manager_router = require('./manager')
const event_router = require('./event')
const vk_auth = require('./controllers/authorization-controller')

api_router.use('/', vk_auth.vk_auth)
api_router.use('/user', user_router)
api_router.use('/manager', manager_router)
api_router.use('/event', event_router)

module.exports = api_router