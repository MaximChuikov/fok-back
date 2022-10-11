import {Request, Response, Router} from "express"
const event_router = Router()
const emitter = require("../service/event-bus");

event_router.get('/rent-change',  (req: Request, res: Response) => {
    emitter.once('rent-change', () => {
        res.json({
            event: 'change'
        })
    })
    emitter.once('rent-delete', () => {
        res.json({
            event: 'delete'
        })
    })
})

event_router.get('/new-request',  (req: Request, res: Response) => {
    emitter.once('new-request', (request: {
        request_id: number, phone: string,
        vk_user_id: number, status: string, variant: string, requested_time: [DateTime]
    }) => {
        res.json(request)
    })
})

event_router.get('/del-request',  (req: Request, res: Response) => {
    emitter.once('not-relevant-request', (request_id: number) => {
        res.json(request_id)
    })
})




module.exports = event_router