import {Router} from "express"
import {body, query} from 'express-validator'
import {check} from './sender-invalid-req-error'

const router = Router()

import authController from '../controllers/authorization-controller'
import authMid from '../middlewares/auth-middleware'
import roleAccess from "../middlewares/roleAccess";
import eventController from "../controllers/eventController";
import bookController from "../controllers/book-controller";

// Auth
router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    check,
    authController.registration
);
router.post('/login',
    body('email').isEmail(),
    body('password').isString(),
    check,
    check, authController.login);
router.post('/logout', authController.logout);
router.get('/activate/:link', authController.activate);
router.get('/refresh', authController.refresh);

// Events
router.get('/archive-events',
    query('from').isDate(),
    query('to').isDate(),
    check,
    eventController.selectArchiveEvents)

router.get('/nearest-events', eventController.selectNearestEvents)
router.get('/future-events', eventController.selectFutureEvents)
router.post('/event', authMid, roleAccess.managerAccess, eventController.addEvent)
router.delete('/event', authMid, roleAccess.managerAccess, eventController.deleteEvent)

//Book
router.get('/show-books',
    query('day').isInt({min: 0}), check,
    bookController.getTable)
router.post('/book', authMid, bookController.createBook)
router.delete('/book',
    query('book_id').isInt({min: 1}), check,
    authMid, bookController.deleteBook)

//Abonnement
router.post('/event', authMid, roleAccess.managerAccess, )

export default router