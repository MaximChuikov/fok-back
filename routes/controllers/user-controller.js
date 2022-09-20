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
            const offset = req.query.offset
            const days = req.query.days

            let i = 0

            console.log(offset, days)
            const dates = await day_of_week.mapNeededDaysToDates(offset, days)
            console.log(dates)

            const schedule = await db.query(`
                SELECT price, starts, ends
                FROM public.aviable_time
                WHERE variant_id = 1
            `).then(r => r.rows)

            for (const day of dates) {
                const events = await db.query(`
                    SELECT name, "end", start
                    FROM public.event
                    WHERE variant_id = 1 AND
                    start <= '${day.dateString}' AND
                    "end" >= '${day.dateString}'
                `).then(r => r.rows).catch(_ => [])

                const add_time = await db.query(`
                    SELECT date, start, "end", price
                        FROM public.additional_time
                        WHERE date = '${day.dateString}'      
                `).then(r => r.rows)

                day.schedule = day.isWorkingDay ?
                    JSON.parse(JSON.stringify(schedule)) : add_time

                //получение брони на текущий день
                const day_booked_time = await db.query(`
                SELECT time_start, time_end
                FROM public.successful_request
                WHERE date = '${day.dateString}'
                    AND is_group = true
                    AND variant_id = 1
            `).then(r => r.rows)

                for (const time of day.schedule) {

                    let isEvent = false;
                    for (const event of events) {
                        const s = time.start.split(':')
                        const time_s = new Date(time.date.getTime())
                        time_s.setHours(s[0], s[1], s[2])
                        const e = time.end.split(':')
                        const time_e = new Date(time.date.getTime())
                        time_e.setHours(e[0], e[1], e[2])

                        if (day_of_week.isTimeCross(time_s, time_e, event.start, event.end)) {
                            time.info = {
                                status: 'event',
                                name: event.name
                            }
                            isEvent = true
                            break
                        }
                    }
                    if (isEvent)
                        continue

                    let isBooked = false
                    for (const booked of day_booked_time) {
                        if (day_of_week.isTimeCross(time.starts, time.ends, booked.time_start, booked.time_end)) {
                            time.info = {
                                status: 'booked'
                            }
                            isBooked = true
                            break
                        }
                    }
                    if (isBooked)
                        continue

                    time.info = {
                        status: 'free',
                        check: i++
                    }
                }
            }

            dates.forEach(date => {
                date.schedule.forEach(time => delete time.date)
                delete date.dateString
                delete date.isWorkingDay
            })
            res.send({
                dates
            })

        } catch (e) {
            res.status(500).send(e)
        }
    }
}

module.exports = new UserController()