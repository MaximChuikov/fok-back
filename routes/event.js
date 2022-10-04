const Router = require('express')
const emitter = require("../service/event-bus");
const event_router = new Router()

event_router.get('/change-rent', async (req, res) => {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
    })
    emitter.on('new-successful-request', (data) => {
        res.write(`data: ${JSON.stringify({
            event: 'new',
            data: data
        })}\n\n`)
    })
    emitter.on('deleted-book', (request_id) => {
        res.write(`data: ${JSON.stringify({
            event: 'delete',
            data: request_id
        })}\n\n`)
    })
})


event_router.get('/new-rent-request', async (req, res) => {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
    })
    emitter.on('new-request', (data) => {
        res.write(`data: ${JSON.stringify(data)} \n\n`)
    })
})




module.exports = event_router