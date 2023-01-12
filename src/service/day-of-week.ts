import {Schedule} from "../types/types";

const available_timeDb = require('../sql_requests/available_time')
const bookDb = require('../sql_requests/book')

const shortMonth = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

// 9 => 09
function pad2(num: number): string {
    return num.toString().padStart(2, '0');
}

export function formatDate(date: Date): { fullDate: string, shortDate: string } {
    return {
        fullDate: `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
        shortDate: `${date.getDate()} ${shortMonth[date.getMonth()]}`
    }
}

function isOver(currentDate: Date, checkingDate: Date): boolean {
    return checkingDate > currentDate
}

function isTimeCross(firstStart: Date, firstEnd: Date,
                     secondStart: Date, secondEnd: Date): boolean {
    return firstEnd > secondStart && firstStart < secondEnd
}

function setTime(date: Date, time: Date): Date {
    const today = new Date(date.getTime())
    today.setHours(0, 0, 0, 0)
    today.setHours(time.getHours(), time.getMinutes(), time.getSeconds())
    return today
}

function deleteSeconds(time: string): string {
    const hms = time.split(':')
    return `${parseInt(hms[0])}:${hms[1]}`
}

export async function schedule(week: number) {
    //current date & time
    const date = new Date()

    //set need week
    const weekDate = new Date(date.getTime())
    weekDate.setDate(weekDate.getDate() + week * 7)

    //monday date of need week
    const mondayDate = new Date(weekDate.getTime())
    mondayDate.setDate(mondayDate.getDate() - (mondayDate.getDay() === 0 ? 6 : mondayDate.getDay() - 1))

    //sunday date of need week
    const sundayDate = new Date(mondayDate.getTime())
    sundayDate.setDate(sundayDate.getDate() + 6)

    //current date in cycle below
    const cycleDate = new Date(mondayDate.getTime())

    let schedule = new Array<Schedule>()
    for (let i = 0; i < 7; i++) {
        //date for response and requests
        const formattedDate = formatDate(cycleDate)
        //primary response formatting

        // @ts-ignore
        schedule[i] = {}
        schedule[i].shortDate = formattedDate.shortDate

        const av_time: {
            timetable: { time_start: Date, time_end: Date }[]
            table: { time: number, price: number }[]
            add_price: number
        } = available_timeDb.selectAvailableTime(cycleDate.getDay())

        // @ts-ignore
        schedule[i].schedule = av_time.timetable.map(e => {
            return {
                time_start: setTime(cycleDate, e.time_start),
                time_end: setTime(cycleDate, e.time_end)
            }
        })

        for (const time of schedule[i].schedule) {
            // @ts-ignore
            time.info = {}
            time.info.status = 'disabled'
            time.info.isOver = isOver(date, time.time_start)
        }
        //get all data on current cycle date for filter
        const booked: {
            start: Date
            count: any
            end: Date
        }[] = []

        for (const book of schedule[i].schedule) {
            booked.push({
                start: book.time_start,
                end: book.time_end,
                count: await bookDb.bookedCount(book.time_start, book.time_end)
            })
        }

        //begin filtering data
        for (const time of schedule[i].schedule) {
            //check time for booking
            let isBooked = false
            for (const book of booked) {
                if (isTimeCross(time.time_start, time.time_end, book.start, book.end)) {
                    if (book.count >= 15) {
                        time.info.status = 'overfilled'
                        time.info.capacity = 15
                        isBooked = true
                        break
                    } else {
                        time.info.filled = book.count
                    }
                }
            }
            if (isBooked)
                continue

            for (const av_t of av_time.table) {
                if (av_t.time === schedule[i].schedule.indexOf(time)) {
                    time.price = av_t.price
                    time.info.status = 'filled'
                    time.info.capacity = 15
                    break
                }
            }


        }
        //next day in cycle
        cycleDate.setDate(cycleDate.getDate() + 1)
    }

    const timetable = available_timeDb.selectTimetable()
    timetable.forEach(time => {
        time.time_start = deleteSeconds(time.time_start)
        time.time_end = deleteSeconds(time.time_end)
    })

    return {
        timetable: timetable,
        schedule: schedule
    }
}