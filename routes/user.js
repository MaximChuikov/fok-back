const Router = require('express')
const user_router = new Router()

const user = require('./controllers/user-controller')

user_router.get('/rent', user.getSchedule)
user_router.post('/rent-request', user.createRequest)

module.exports = user_router