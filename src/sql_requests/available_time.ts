function fill_timetable(hours: number[]): { time_start: Date, time_end: Date }[] {
    const zeroDate = () => new Date(0)
    return hours.map(e => {
        const start = zeroDate()
        start.setHours(e)
        const end = zeroDate()
        end.setHours(e + 1)
        return {
            time_start: start,
            time_end: end
        }
    })
}

const timetable_for_gym = fill_timetable([
    8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
])
const price_for_gym = timetable_for_gym.map((e, index) => {
    return {
        time: index,
        price: 200
    }
})

const gym_schedule = {
    timetable: timetable_for_gym,
    time_price: [
        price_for_gym,
        price_for_gym,
        price_for_gym,
        price_for_gym,
        price_for_gym,
        price_for_gym,
        price_for_gym,
    ]
}

class AvailableTime {
    selectAvailableTime(day_of_week: number): {
        timetable: { time_start: Date, time_end: Date }[]
        table: { time: number, price: number }[]
    } {
        return {
            timetable: gym_schedule.timetable.filter(() => true),
            table: gym_schedule.time_price[day_of_week].filter(() => true),
        }
    }

    selectTimetable(): { time_start: Date, time_end: Date }[] {
        return gym_schedule.timetable.filter(() => true)
    }
}

module.exports = new AvailableTime()