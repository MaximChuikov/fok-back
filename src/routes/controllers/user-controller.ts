import {Request, Response} from "express";
import Group from "../../vk_methods/group";

const emitter = require('../../service/event-bus');
const day_of_week = require('../../service/day-of-week')
const db_request = require('../../sql_requests/request')

class UserController {
    async getSchedule(req: Request, res: Response) {
        try {
            const week = req.query.week
            const variant_id = req.query.variant_id

            const dates = await day_of_week.schedule(week, variant_id)

            res.send({
                timetable: dates.timetable,
                schedule: dates.schedule
            })
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
    async createRequest(req: Request, res: Response) {
        try {
            const body = req.body
            const request_id = await db_request.createRequest(body.variant_id, body.phone, req.vk_id, body.requests)
            await Group.sendMessageFromGroup(`Ваша заявка №${request_id} принята в рассмотрение`, req.vk_id)
            const thisRequest = await db_request.selectRequest(request_id)
            emitter.emit('new-request', thisRequest)
            res.send('ok')
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
}

module.exports = new UserController()