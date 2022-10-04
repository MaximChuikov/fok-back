const db_event = require('../sql_requests/event')
const db_available_time = require('../sql_requests/available_time')
const db_request = require('../sql_requests/request')
const db_add_time = require('../sql_requests/additional_time')

const workingDays = [0, 6]
const shortDay = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const shortMonth = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

// 9 => 09
function pad2(num){
    return num.toString().padStart(2, '0');
}

function toYearHour(date) {
    return (
        [
            date.getFullYear(),
            pad2(date.getMonth() + 1),
            pad2(date.getDate()),
        ].join('-') +
        ' ' +
        [
            pad2(date.getHours()),
            pad2(date.getMinutes()),
            pad2(date.getSeconds()),
        ].join(':')
    );
}

function formatDate(date) {
    return {
        fullDate: `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
        shortDate: `${date.getDate()} ${shortMonth[date.getMonth()]}`
    }
}

function isOver(currentDate, checkingDateString, startTime) {
    const checkingDate = createDate(checkingDateString, startTime)
    return currentDate > checkingDate
}

function isTimeCross(firstStart, firstEnd, secondStart, secondEnd) {
    return firstEnd > secondStart && firstStart < secondEnd
}

function createDate(date, time) {
    const ymd = date.split('-')
    const hms = time.split(':')
    return new Date(ymd[0], ymd[1] - 1, ymd[2], hms[0], hms[1], hms[2])
}

function deleteSeconds(timeString) {
    const hms = timeString.split(':')
    return `${parseInt(hms[0])}:${hms[1]}`
}

async function schedule(week, variant_id) {
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

    //schedule standard
    const [, available_time] = await db_available_time.selectAvailableTime(variant_id)
    //current date in cycle below
    const cycleDate = new Date(mondayDate.getTime())

    const schedule = []
    for (let i = 0; i < 7; i++) {
        //date for response and requests
        const formattedDate = formatDate(cycleDate)
        //primary response formatting
        schedule[i] = formattedDate
        schedule[i].schedule = JSON.parse(JSON.stringify(available_time))
        schedule[i].schedule.forEach(time => {
            time.info = {
                status: 'disabled',
                isOver: isOver(date, formattedDate.fullDate, time.time_start)
            }
        })
        //get all data on current cycle date for filter
        const [ev_er, events] = await db_event.selectEvent(variant_id, formatDate(cycleDate).fullDate)
        const [bo_er, booked] = await db_request.selectAcceptedRequests(variant_id, formatDate(cycleDate).fullDate)
        const [ad_er, addTime] = await db_add_time.selectAddTime(variant_id, formatDate(cycleDate).fullDate)

        if (!ev_er || !bo_er || !ad_er){
            console.error(ev_er, bo_er, ad_er, events, booked, addTime)

        }
        else
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
                if (isTimeCross(time.time_start, time.time_end, book.time_start, book.time_end)) {
                    time.info.status = 'booked'
                    isBooked = true
                    break
                }
            }
            if (isBooked)
                continue

            //giving status free
            if (workingDays.includes(cycleDate.getDay())) {
                //on work day, all time have status free
                time.info.status = 'free'
            } else {
                //on non-working days, should check additional time
                for (const add of addTime) {
                    if (isTimeCross(time.time_start, time.time_end, add.time_start, add.time_end)) {
                        time.info.status = 'free'
                        break
                    }
                }
            }
        }
        //next day in cycle
        cycleDate.setDate(cycleDate.getDate() + 1)
    }

    available_time.forEach(time => {
        time.time_start = deleteSeconds(time.time_start)
        time.time_end = deleteSeconds(time.time_end)
    })

    return {
        timetable: available_time,
        schedule: schedule
    }
}

module.exports = {
    schedule
}
