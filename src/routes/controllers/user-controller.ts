import {Request, Response} from "express";
import Group from "../../vk_methods/group";

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

            const user_data: [{request_id: number, phone: string, vk_user_id: number, variant_id: number, requested_time: [DateTime]}]
                = await db_request.selectUserRequests(req.vk_id)

            if (user_data.length > 2)
                return res.status(409).send('Запрещено иметь более двух броней');
            if (body.requests.length > 4)
                return res.status(409).send('Запрещено бронировать более 4 часов');


            const user_time = user_data
                .filter(request => request.variant_id === body.variant_id)
                .map(e => e.requested_time)
                .flat(1)

            if (day_of_week.findCrossing(body.requests, user_time))
                return res.status(409).send('Вы уже забронировали это время');

            const acceptedRent = await db_request.selectAllAcceptedRequests(body.variant_id)
            if (day_of_week.findCrossing(body.requests, acceptedRent))
                return res.status(409).send('Время уже занято другим человеком');

            const request_id = await db_request.createRequest(body.variant_id, body.phone, req.vk_id, body.requests)
            await Group.sendMessageFromGroup(`Ваша заявка №${request_id} принята в рассмотрение`, req.vk_id)
            res.send('ok')
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
}

module.exports = new UserController()