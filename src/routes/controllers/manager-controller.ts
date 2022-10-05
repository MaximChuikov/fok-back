import { Request, Response } from 'express';
const emitter = require('../../service/event-bus');
const vk_methods = require('../../vk_methods/group')
const db_manager = require('../../sql_requests/manager')
const db_request = require('../../sql_requests/request')

class ManagerController{
    async isManager(req: Request, res: Response) {
        try {
            const who = await db_manager.isManager(req.vk_id)
            res.send(who)
        }catch (e) {
            res.status(500).send(e.message)
        }
    }

    async rentRequests(req: Request, res: Response) {
        try {
            const variant_id = req.query.variant_id
            const r = await db_request.selectRequests(variant_id, 1)

            r.forEach((x: any) => {
                x.vk_url = `https://vk.com/id${x.user_vk_id}`
                delete x.user_vk_id
            })
            res.send(r)
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
    async denyRentRequest(req: Request, res: Response){
        try {
            const request_id = req.query.request_id
            const text = req.body
            const vk_id = await db_request.deleteRequest(request_id)
            await vk_methods.sendMessageFromGroup(
                `К сожалению, ваша бронь №${request_id} отклонена.` + text && `\nПричина: ${text}`,
                vk_id
            )
            res.send("ok")
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
    async acceptRentRequest(req: Request, res: Response){
        try {
            const request_id = req.query.request_id
            const vk_user_id = await db_request.acceptRequest(request_id)
            await vk_methods.sendMessageFromGroup('Ваша заявка принята, ждем вас', vk_user_id)
            emitter.emit('new-successful-request', request_id)
            res.send('ok')
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
    // async deleteSuccessfulRequest(req: Request, res: Response) {
    //     try{
    //         const request_id = req.params.request_id
    //         const [ok, ] = await db_request.deleteRequest(request_id)
    //         if (ok) {
    //             emitter.emit('deleted-book', request_id)
    //         }
    //     } catch (e) {
    //         res.status(500).send(e.message)
    //     }
    // }
}

module.exports = new ManagerController()