import {Request, Response} from 'express';
import {formatDate} from "../../service/day-of-week";
const db_variant = require("../../sql_requests/variant")
const day_of_week = require("../../service/day-of-week")
const vk_methods = require('../../vk_methods/group')
const db_manager = require('../../sql_requests/manager')
const db_request = require('../../sql_requests/request')
const db_event = require('../../sql_requests/event')
const db_addTime = require('../../sql_requests/additional_time')

class ManagerController {
    async isManager(req: Request, res: Response) {
        try {
            const who = await db_manager.isManager(req.vk_id)
            res.send(who)
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

    async rentRequests(req: Request, res: Response) {
        try {
            const variant_id = req.query.variant_id
            const r = await db_request.selectRequests(variant_id, 1)

            r.forEach((x: {
                vk_url: string;
                request_id: number, phone: string, vk_user_id: number, requested_time: { req_date: Date, req_start: string, req_end: string }[]
            }) => {
                for (const time of x.requested_time) {
                    // @ts-ignore
                    time.req_date = formatDate(time.req_date).fullDate
                }
                x.vk_url = `https://vk.com/id${x.vk_user_id}`
                delete x.vk_user_id
            })
            res.send(r)
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

    async denyRentRequest(req: Request, res: Response) {
        try {
            const request_id = req.body.request_id
            const vk_id = await db_request.deleteRequest(request_id)
            await vk_methods.sendMessageFromGroup(`Ваша бронь №${request_id} отменена.`, vk_id)
            res.send("ok")
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

    async acceptRentRequest(req: Request, res: Response) {
        try {
            const request_id = req.body.request_id
            const {variant_id, requested_time} = await db_request.selectRequest(request_id)
            const variant_info = await db_variant.selectVariant(variant_id)
            if (variant_info.whole) {
                const acceptedRent = await db_request.selectAllAcceptedRequests(variant_id)
                if (day_of_week.findCrossing(requested_time, acceptedRent))
                    return res.status(409).send('Время уже занято другим человеком');
            } else {
                for (const time of requested_time) {
                    const fill = await db_request.selectCount(variant_id, time.date, time.start, time.end)
                    if (fill + 1 > variant_info.capacity)
                        return res.status(409).send('На это время уже забронировано максимальное количество человек');
                }
            }

            const vk_user_id = await db_request.acceptRequest(request_id)
            await vk_methods.sendMessageFromGroup(`Ваша заявка №${request_id} принята, ждем вас`, vk_user_id)
            res.send('ok')
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

    async selectEvents(req: Request, res: Response) {
        try {
            const hall_id = req.query.hall_id
            const events = await db_event.selectAllEvents(hall_id)
            res.send(events)
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

    async deleteEvent(req: Request, res: Response) {
        try {
            const event_id = req.query.event_id
            await db_event.deleteEvent(event_id)
            res.send('ok')
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

    async addEvent(req: Request, res: Response) {
        try {
            const time: Timestamp = {start: req.body.start, end: req.body.end}
            const name: string = req.body.name
            const hall_id: number = req.body.hall_id
            await db_event.addNewEvent(time, name, hall_id)
            res.send('ok')
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

    async addTime(req: Request, res: Response) {
        try {
            const start: string = req.body.start
            const end: string = req.body.end
            const date: string = req.body.date
            const hall_id: number = req.body.hall_id
            await db_addTime.createAddTime(hall_id, date, start, end)
            res.send('ok')
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

    async selectAllRequests(req: Request, res: Response) {
        try {
            const data = await db_request.selectTheAllAcceptedRequests()
            res.send(data)
        } catch (e) {
            res.status(500).send(e.message)
        }
    }

}

module.exports = new ManagerController()