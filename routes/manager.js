const Router = require('express')
const maganer_router = new Router()
const manager_controller = require('./controllers/manager-controller')
const auth = require("./controllers/authorization-controller");


maganer_router.get('/is-manager', manager_controller.isManager)

maganer_router.use(auth.manager_auth)

maganer_router.get('/rent-requests', manager_controller.rentRequests)
maganer_router.post('/deny-request', manager_controller.denyRentRequest)

maganer_router.post('/confirm-request', manager_controller.acceptRentRequest)


module.exports = maganer_router