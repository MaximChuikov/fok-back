const db = require('../database')
const workingDays = [0, 6]
const shortName = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

function daysToWorkDay(day){
    let days_to_work_day = 0
    while (!workingDays.includes(day)) {
        day += 1 % 7
        days_to_work_day++
    }
    days_to_work_day--
    return days_to_work_day
}

async function mapNeededDaysToDates(sets, days_in_set) {
    const date = new Date()
    const dates = []

    for (let set = 0, days = 0; set <= parseInt(sets);) {
        if (workingDays.includes(date.getDay())) {
            days++
            if (days > days_in_set) {
                set++
                days = 1
            }
            if (set === parseInt(sets)) {
                dates.push(
                    {
                        dateString: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                        dateShort: `${date.getDate()} ${shortName[date.getDay()]}`,
                        isWorkingDay: true
                    }
                )
            }
        } else {
            //check days between the next work day
            const days_to_work_day = daysToWorkDay(date.getDay())
            if (days_to_work_day > 0) {
                const current_date = `'${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}'`
                date.setDate(date.getDate() + days_to_work_day)
                const next_date = `'${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}'`

                const days_between = await db.query(`
                    SELECT DISTINCT date
                    FROM public.additional_time
                    WHERE date >= ${current_date} AND date <= ${next_date}
                `).then(r => r.rows).catch(e => [])

                if (days_between.length > 0) {
                    days_between.forEach(d => {
                        days++
                        if (days > days_in_set) {
                            set++
                            days = 1
                        }
                        if (set === parseInt(sets)) {
                            dates.push(
                                {
                                    dateString: `${d.date.getFullYear()}-${d.date.getMonth() + 1}-${d.date.getDate()}`,
                                    dateShort: `${d.date.getDate()} ${shortName[d.date.getDay()]}`,
                                    isWorkingDay: false
                                }
                            )
                        }
                    })
                }
            }
        }
        date.setDate(date.getDate() + 1)
    }
    return dates
}

function isTimeCross(firstStart, firstEnd, secondStart, secondEnd){
    return firstEnd > secondStart && firstStart < secondEnd
}
function createDate(date, time){
    const ymd = date.split('-')
    const hms = time.split(':')
    const parsed_date = new Date(ymd[0],ymd[1] - 1,ymd[2],hms[0], hms[1], hms[2])
    return parsed_date
}

async function getSchedule(set, days, variant){
    const dates = await mapNeededDaysToDates(set, days)

    const schedule = await db.query(`
                SELECT price, starts, ends
                FROM public.aviable_time
                WHERE variant_id = ${variant}
            `).then(r => r.rows)

    for (const day of dates) {
        const events = await db.query(`
                    SELECT name, "end", start
                    FROM public.event
                    WHERE variant_id = ${variant} AND
                    start <= '${day.dateString}' AND
                    "end" >= '${day.dateString}'
                `).then(r => r.rows).catch(_ => [])

        const add_time = await db.query(`
            SELECT date, start, "end", price
                FROM public.additional_time
                WHERE date = '${day.dateString}'
                AND variant_id = ${variant}
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
                const time_s = createDate(day.dateString, time.starts)
                const time_e = createDate(day.dateString, time.ends)

                if (isTimeCross(time_s, time_e, event.start, event.end)) {
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
                if (isTimeCross(time.starts, time.ends, booked.time_start, booked.time_end)) {
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
                status: 'free'
            }
        }
    }

    dates.forEach(date => {
        date.schedule.forEach(time => delete time.date)
        delete date.isWorkingDay
    })

    return dates
}

module.exports = {
    getSchedule
}
