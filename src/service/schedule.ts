import {Schedule, Timetable} from "../types/types";
import book from "../sql_requests/book";
const available_timeDb = require('../sql_requests/available_time')


const shortMonth = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
const formatDate = (date: Date) => `${date.getDate()} ${shortMonth[date.getMonth()]}`

function isOver(currentDate: Date, checkingDate: Date): boolean {
    return checkingDate <= currentDate
}

export async function schedule(day: number) {
    const currentDate = new Date()
    const reqDate = new Date(currentDate.getTime())
    reqDate.setDate(reqDate.getDate() + day)

    const timetable: Timetable = available_timeDb.selectAvailableTime(reqDate)

    const schedule = {} as Schedule
    schedule.shortDate = formatDate(reqDate)
    schedule.schedule = []

    for (const time of timetable) {
        const over = isOver(currentDate, time.time_start)
        const booked = await book.bookedCount(time.time_start, time.time_end)
        const status = booked >= 15 ? 'overfilled' : 'available'

        schedule.schedule.push({
            ...time,
            info: {
                status: status,
                filled: booked,
                isOver: over,
                capacity: 15
            }
        })
    }

    return schedule
}