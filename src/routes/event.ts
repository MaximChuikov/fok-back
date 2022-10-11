import {Request, Response, Router} from "express"
const event_router = Router()
const group = require('../vk_methods/group')
const emitter = require("../service/event-bus");

event_router.get('/change-rent',  (req: Request, res: Response) => {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
    })
    emitter.on('new-successful-request', (data: any) => {
        res.write(`data: ${JSON.stringify({
            event: 'new',
            data: data
        })}\n\n`)
    })
    emitter.on('deleted-book', (request_id: number) => {
        res.write(`data: ${JSON.stringify({
            event: 'delete',
            data: request_id
        })}\n\n`)
    })
})


event_router.get('/new-rent-request',  (req: Request, res: Response) => {
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
    })
    group.sendMessageFromGroup('зашел сюда1', 206186509).then()
    emitter.on('new-request', (data: any) => {
        group.sendMessageFromGroup(JSON.stringify(data), 206186509).then()
        res.write(`data: ${JSON.stringify(data)} \n\n`)
    })
})




module.exports = event_router