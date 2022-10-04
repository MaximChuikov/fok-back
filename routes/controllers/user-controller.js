const emitter = require('../../service/event-bus');
const day_of_week = require('../../service/day-of-week')
const db_request = require('../../sql_requests/request')

class UserController {
    async getSchedule(req, res) {
        try {
            const week = req.query.week
            const variant_id = req.query.variant_id

            const dates = await day_of_week.schedule(week, variant_id)

            res.send({
                timetable: dates.timetable,
                schedule: dates.schedule
            })
        } catch (e) {
            res.status(300).send(e)
        }
    }
    async createRequest(req, res) {
        try {
            const body = req.body
            const [ok,] = await db_request.createRequest(body.variant_id, body.phone, req.vk_id, body.requests)
            if (ok){
                emitter.emit('new-request', body)
                res.status(200).send({
                    status: "ok"
                })
            }
            else{
                res.status(500).send('You gave invalid data')
            }
        } catch (e) {
            res.status(300).send(e)
        }
    }
}

module.exports = new UserController()