import {Router} from "express"
import {body, query} from 'express-validator'
import {check} from './sender-invalid-req-error'

const router = Router()

import authController from '../controllers/authorization-controller'
import authMid from '../middlewares/auth-middleware'
import roleAccess from "../middlewares/roleAccess";
import eventController from "../controllers/eventController";
import bookController from "../controllers/book-controller";
import abonnementController from "../controllers/abonnement-controller";

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
router.get('/show-books', authMid,
    query('day').isInt({min: 0}), check,
    bookController.getTable)
router.get('/my-books', authMid, bookController.myBooks)
router.post('/book', authMid, bookController.createBook)
//TODO: 1
router.delete('/book',
    query('book_id').isInt({min: 1}), check,
    authMid, bookController.cancelBook)
//TODO: 1
router.delete('/admin-book',
    query('book_id').isInt({min: 1}), check,
    authMid, roleAccess.managerAccess, bookController.adminCancelBook)
router.get('/time-full-info', authMid, roleAccess.managerAccess,
    query('time_start'), query('time_end'), check,
    bookController.getFullInfoAboutTimeBooks)
//TODO:
router.post('/apply-book',
    query('book_id').isInt({min: 1}), check,
    authMid, roleAccess.managerAccess, bookController.applyBook)

//Abonnement
router.post('/assign-ten-visits-abonnement', authMid, roleAccess.managerAccess,
    query('user_id').isInt({min: 1}), check, abonnementController.assignTenVisits)
router.post('/assign-two-months-abonnement', authMid, roleAccess.managerAccess,
    query('user_id').isInt({min: 1}), check, abonnementController.assignTwoMonths)

router.get('/my-abonnement-info', authMid, abonnementController.myAbonnementInfo)
router.get('/user-abonnement-info', authMid, roleAccess.managerAccess,
    query('user_id').isInt({min: 1}), check, abonnementController.userAbonnementInfo)
router.put('/decrease-visits', authMid, roleAccess.managerAccess,
    query('user_id').isInt({min: 1}),
    query('visits').isInt({min: 1}), check, abonnementController.decreaseUserVisits)

export default router