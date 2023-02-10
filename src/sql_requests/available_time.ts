import {Timetable} from "../types/types";

const gym_work_hours = [ 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ]

function fill_timetable(date: Date): { time_start: Date, time_end: Date, price: number}[] {
    const copyDate = () => {
        const r = new Date(date.getTime())
        r.setHours(0,0,0,0)
        return r
    }
    return gym_work_hours.map(e => {
        const start = copyDate()
        start.setHours(e)
        const end = copyDate()
        end.setHours(e + 1)
        return {
            time_start: start,
            time_end: end,
            price: 200
        }
    })
}

class AvailableTime {
    selectAvailableTime(date: Date): Timetable {
        return fill_timetable(date)
    }
}

module.exports = new AvailableTime()