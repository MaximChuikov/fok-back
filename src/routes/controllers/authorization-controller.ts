import {tryAuth} from "../../vk_methods/auth";
import {Request, Response, NextFunction} from 'express';

const db_manager = require('../../sql_requests/manager')

class AuthorizationController {
    async vk_auth(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization
            await tryAuth(req, res, next, authHeader)
        } catch (e) {
            res.status(500).end(e.message + '\nError in vk auth')
        }
    }

    async manager_auth(req: Request, res: Response, next: NextFunction) {
        try {
            if (await db_manager.isManager(req.vk_id))
                next()
            else
                res.status(401).send('You are not a manager')
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
}

module.exports = new AuthorizationController()