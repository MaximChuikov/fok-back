const db_event = require('../sql_requests/event')
const db_available_time = require('../sql_requests/available_time')
const db_request = require('../sql_requests/request')
const db_add_time = require('../sql_requests/additional_time')
const db_variant = require('../sql_requests/variant')

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

function isOver(currentDate: Date, checkingDate: string, startTime: string): boolean {
    const chDate = createDate(checkingDate, startTime)
    return currentDate > chDate
}

function isTimeCross(firstStart: string | Date, firstEnd: string | Date,
                     secondStart: string | Date, secondEnd: string | Date): boolean {
    return firstEnd > secondStart && firstStart < secondEnd
}

function createDate(date: string, time: string): Date {
    const ymd = date.split('-')
    const hms = time.split(':')
    return new Date(parseInt(ymd[0]), parseInt(ymd[1]) - 1, parseInt(ymd[2]), parseInt(hms[0]), parseInt(hms[1]), parseInt(hms[2]))
}

function deleteSeconds(time: string): string {
    const hms = time.split(':')
    return `${parseInt(hms[0])}:${hms[1]}`
}

export async function schedule(week: number, variant_id: number, hall_id: number) {
    //get info about sport variant
    const variant: { name: string, hall: number, whole: boolean, capacity: number } = await db_variant.selectVariant(variant_id)
    const isWholeHall = variant.whole

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
        schedule[i].fullDate = formattedDate.fullDate
        schedule[i].shortDate = formattedDate.shortDate
        const av_time = db_available_time.selectAvailableTime(variant_id, cycleDate.getDay())
        const available_time: { time: number, price: number }[] = av_time.table
        const timetable: { time_start: string, time_end: string }[] = av_time.timetable
        // @ts-ignore
        schedule[i].schedule = timetable

        for (const time of schedule[i].schedule) {
            // @ts-ignore
            time.info = {}
            time.info.status = 'disabled'
            time.info.isOver = isOver(date, formattedDate.fullDate, time.time_start)
        }
        //get all data on current cycle date for filter
        const events = await db_event.selectEvent(hall_id, formatDate(cycleDate).fullDate)
        const booked = isWholeHall
            ? await db_request.selectAcceptedRequestsByDate(hall_id, formatDate(cycleDate).fullDate)
            : await db_request.selectAcceptedRequestsByDateWithCount(variant_id, formatDate(cycleDate).fullDate, timetable);
        const addTime = await db_add_time.selectAddTime(hall_id, formatDate(cycleDate).fullDate)

        //begin filtering data
        for (const time of schedule[i].schedule) {
            //check time for event
            let isEvent = false;
            for (const event of events) {
                const time_s = createDate(formattedDate.fullDate, time.time_start)
                const time_e = createDate(formattedDate.fullDate, time.time_end)
                if (isTimeCross(time_s, time_e, event.event_start, event.event_end)) {
                    time.info.status = 'event'
                    time.info.name = event.name
                    isEvent = true
                    break
                }
            }
            if (isEvent)
                continue

            //check time for booking
            let isBooked = false
            for (const book of booked) {
                if (isWholeHall) {
                    if (isTimeCross(time.time_start, time.time_end, book.req_start, book.req_end)) {
                        time.info.status = 'booked'
                        isBooked = true
                        break
                    }
                } else {
                    if (isTimeCross(time.time_start, time.time_end, book.time_start, book.time_end)) {
                        if (book.filled >= variant.capacity) {
                            time.info.status = 'overfilled'
                            // @ts-ignore
                            time.info.capacity = variant.capacity
                            isBooked = true
                            break
                        } else {
                            time.info.filled = book.filled
                        }
                    }
                }
            }
            if (isBooked)
                continue


            for (const av_t of available_time) {
                if (av_t.time === schedule[i].schedule.indexOf(time)) {
                    time.price = av_t.price
                    if (isWholeHall) {
                        time.info.status = 'free'
                        break
                    } else {
                        time.info.status = 'filled'
                        time.info.capacity = variant.capacity
                        break
                    }
                } else if (isWholeHall) {
                    for (const add of addTime) {
                        if (isTimeCross(time.time_start, time.time_end, add.time_start, add.time_end)) {
                            //TODO: узнать цену
                            time.price = 200
                            time.info.status = 'free'
                            break
                        }
                    }
                }

            }
        }
        //next day in cycle
        cycleDate.setDate(cycleDate.getDate() + 1)
    }

    const timetable = db_available_time.selectTimetable(variant_id)
    timetable.forEach(time => {
        time.time_start = deleteSeconds(time.time_start)
        time.time_end = deleteSeconds(time.time_end)
    })

    return {
        timetable: timetable,
        schedule: schedule
    }
}

export function findCrossing(first: DateTime[], second: DateTime[]) {
    for (const sec of second) {
        //@ts-ignore
        const s = JSON.stringify({date: formatDate(sec.req_date).fullDate, start: sec.req_start, end: sec.req_end})
        for (const ft of first) {
            const o = JSON.stringify({date: ft.date, start: ft.start, end: ft.end})
            if (o === s)
                return true
        }
    }
    return false
}