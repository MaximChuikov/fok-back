const db = require('../database')
const workingDays = [0, 6]
const shortName = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

async function mapNeededDaysToDates(sets, days_in_set) {
    const date = new Date()
    const dates = []

    for (let set = 1, days = 0; set <= parseInt(sets);) {
        if (workingDays.includes(date.getDay())) {
            days++
            if (days > days_in_set) {
                set++
                days = 0
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
            let day = date.getDay()
            let days_to_work_day = 0
            while (!workingDays.includes(day)) {
                day += 1 % 7
                days_to_work_day++
            }
            days_to_work_day--
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
                            days = 0
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
    return firstEnd >= secondStart && firstStart <= secondEnd
}

module.exports = {
    mapNeededDaysToDates,
    isTimeCross
}
