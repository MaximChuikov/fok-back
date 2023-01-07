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

const timetable_for_all = fill_timetable([
    8, 9, 10, 11, 12, 15, 16, 17, 18, 19
])

const price_for_all = timetable_for_all.map((e, index) => {
    return {
        time: index,
        price: 2000
    }
})


const timetable_for_gym = fill_timetable([
    8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
])
const price_for_gym = timetable_for_gym.map((e, index) => {
    return {
        time: index,
        price: 200
    }
})


const schedule = [
    //variant_id
    {
        //футбол весь зал
        variant_id: 1,
        add_price: 2000,
        timetable: timetable_for_all,
        //воскр, понед, ..., субб
        time_price: [
            price_for_all,
            [],
            [],
            [],
            [],
            [],
            price_for_all
        ]
    },
    {
        //футбол случ. состав
        variant_id: 2,
        timetable: fill_timetable([
            13, 14
        ]),
        time_price: [
            [],
            [],
            [],
            [],
            [],
            [],
            [
                {
                    time: 0,
                    price: 200
                },
                {
                    time: 1,
                    price: 200
                }
            ],
        ]
    },
    {
        //баскет весь зал
        variant_id: 3,
        add_price: 2000,
        timetable: timetable_for_all,
        time_price: [
            price_for_all,
            [],
            [],
            [],
            [],
            [],
            price_for_all
        ]
    },
    {
        //баскет случ. состав
        variant_id: 4,
        timetable: fill_timetable([
            13, 14
        ]),
        time_price: [
            [
                {
                    time: 0,
                    price: 200
                },
                {
                    time: 1,
                    price: 200
                }
            ],
            [],
            [],
            [],
            [],
            [],
            [],
        ]
    },
    {
        //тренажерный зал
        variant_id: 5,
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
];

class AvailableTime {
    selectAvailableTime(variant_id: number, day_of_week: number): {
        timetable: { time_start: Date, time_end: Date }[]
        table: { time: number, price: number }[]
        add_price: number
    } {
        const sch = schedule.find(e => e.variant_id == variant_id)
        return {
            timetable: sch.timetable.filter(() => true),
            table: sch.time_price[day_of_week].filter(() => true),
            add_price: sch.add_price
        }
    }

    selectTimetable(variant_id: number): { time_start: Date, time_end: Date }[] {
        const sch = schedule.find(e => e.variant_id == variant_id)
        return sch.timetable.filter(() => true)
    }
}

module.exports = new AvailableTime()