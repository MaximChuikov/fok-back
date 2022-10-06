import { body, query } from 'express-validator'
import {check} from './sender-invalid-req-error'
const Router = require('express')
const user_router = new Router()

const user = require('./controllers/user-controller')

user_router.get('/rent',
    query('week').isInt({min: 0}),
    query('variant_id').isInt({min: 1}),
    check,
    user.getSchedule)

user_router.post('/rent-request',
    body('variant_id').isInt({min: 1}),
    body('phone').isMobilePhone('ru-RU'),
    body('requests').isArray(),
    body('requests.*.date').isString(),
    body('requests.*.start').isString(),
    body('requests.*.end').isString(),
    check,
    user.createRequest)

module.exports = user_router