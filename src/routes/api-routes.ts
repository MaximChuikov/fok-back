import {Router} from "express"
const api_router = Router()
import { body, query, header } from 'express-validator'
import {check} from './sender-invalid-req-error'

const user_router = require('./user')
const manager_router = require('./manager')
const event_router = require('./event')
const vk_auth = require('./controllers/authorization-controller')

api_router.use('/event',
    query('authorization', 'No authorization header').isString(),
    check,
    event_router
)

api_router.use(
    header('authorization', 'No authorization header').isString(),
    check,
    vk_auth.vk_auth
)
api_router.use('/user', user_router)
api_router.use('/manager', manager_router)


module.exports = api_router