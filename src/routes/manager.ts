import {Router} from 'express'
import {body, query} from "express-validator";
import {check} from "./sender-invalid-req-error";
const manager_router = Router()
const manager_controller = require('./controllers/manager-controller')
const auth = require("./controllers/authorization-controller");


manager_router.get('/is-manager', manager_controller.isManager)

manager_router.use(auth.manager_auth)

manager_router.get('/rent-requests',
    query('variant_id').isInt({min: 1}),
    check,
    manager_controller.rentRequests)

manager_router.post('/deny-request',
    query('request_id').isInt(),
    body().isString(),
    check,
    manager_controller.denyRentRequest)

manager_router.post('/confirm-request',
    manager_controller.acceptRentRequest)


module.exports = manager_router