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
    body('request_id').isInt(),
    check,
    manager_controller.denyRentRequest)

manager_router.post('/confirm-request',
    body('request_id').isInt(),
    check,
    manager_controller.acceptRentRequest)

manager_router.post('/event',
    body('start').isString(),
    body('end').isString(),
    body('name').isString(),
    body('hall_id').isInt(),
    check,
    manager_controller.addEvent)

manager_router.get('/event',
    query('hall_id').isInt(),
    check,
    manager_controller.selectEvents)

manager_router.delete('/event',
    query('event_id').isInt(),
    check,
    manager_controller.deleteEvent)

manager_router.post('/add-time',
    body('start').isDate(),
    body('end').isDate(),
    body('date').isString(),
    body('hall_id').isInt(),
    check,
    manager_controller.addTime)

manager_router.get('/all-requests', manager_controller.selectAllRequests)

module.exports = manager_router