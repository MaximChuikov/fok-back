import {Router} from "express"
import {body} from 'express-validator'
import {check} from './sender-invalid-req-error'
const router = Router()

// const user_router = require('./user')
// const manager_router = require('./manager')
import userController from '../controllers/authorization-controller'


router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    check,
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);

// router.use('/user', user_router)
// router.use('/manager', manager_router)


export default router