const db = require('../../database')
const day_of_week = require('../../service/day-of-week')

class UserController {
    async getAccountInfo(req, res) {
        try {
            const r = await db.query(`
                SELECT * FROM public.variant
            `)
            res.send(r.rows)
        } catch (e) {
            res.status(500).end(e.message)
        }
    }

    async getSportHallRent(req, res) {
        try {
            const set = req.query.set
            const days = req.query.days_in_set

            const dates = await day_of_week.getSchedule(set, days, 1)

            res.send({
                dates
            })

        } catch (e) {
            res.status(300).send(e)
        }
    }
}

module.exports = new UserController()