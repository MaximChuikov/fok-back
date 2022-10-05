const axios = require('axios')
import {Request, Response, NextFunction} from 'express';

const db_manager = require('../../sql_requests/manager')

class AuthorizationController {
    async vk_auth(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization
            if (!authHeader)
                res.status(501).end("No Authorization header")
            else {
                const url = `https://api.vk.com/method/secure.checkToken?token=${authHeader}&access_token=776291817762918177629181397472ed1377762776291811469c49e559114640fa4541e&v=5.131`
                await axios.get(url).then((r: { data: { error: any; response: { user_id: number; }; }; }) => {
                    if (r.data.error) {
                        res.status(401).send(r.data.error)
                    } else {
                        req.vk_id = r.data.response.user_id
                        next()
                    }

                })
            }
        } catch (e) {
            res.status(500).end(e.message)
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