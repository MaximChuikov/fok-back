const timetable_for_all = [
    {
        time_start: '8:00:00',
        time_end: '9:00:00',
    },
    {
        time_start: '9:00:00',
        time_end: '10:00:00',
    },
    {
        time_start: '10:00:00',
        time_end: '11:00:00',
    },
    {
        time_start: '11:00:00',
        time_end: '12:00:00',
    },
    {
        time_start: '12:00:00',
        time_end: '13:00:00',
    },
    {
        time_start: '15:00:00',
        time_end: '16:00:00',
    },
    {
        time_start: '16:00:00',
        time_end: '17:00:00',
    },
    {
        time_start: '17:00:00',
        time_end: '18:00:00',
    },
    {
        time_start: '18:00:00',
        time_end: '19:00:00',
    },
    {
        time_start: '19:00:00',
        time_end: '20:00:00',
    }
]

const price_for_all = timetable_for_all.map((e, index) => {
    return {
        time: index,
        price: 2000
    }
})


const timetable_for_gym = [
    {
        time_start: '8:00:00',
        time_end: '9:00:00',
    },
    {
        time_start: '9:00:00',
        time_end: '10:00:00',
    },
    {
        time_start: '10:00:00',
        time_end: '11:00:00',
    },
    {
        time_start: '11:00:00',
        time_end: '12:00:00',
    },
    {
        time_start: '12:00:00',
        time_end: '13:00:00',
    },
    {
        time_start: '13:00:00',
        time_end: '14:00:00',
    },
    {
        time_start: '14:00:00',
        time_end: '15:00:00',
    },
    {
        time_start: '15:00:00',
        time_end: '16:00:00',
    },
    {
        time_start: '16:00:00',
        time_end: '17:00:00',
    },
    {
        time_start: '17:00:00',
        time_end: '18:00:00',
    },
    {
        time_start: '18:00:00',
        time_end: '19:00:00',
    },
    {
        time_start: '19:00:00',
        time_end: '20:00:00',
    }
]
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
        timetable: [
            {
                time_start: '13:00:00',
                time_end: '14:00:00',
            },
            {
                time_start: '14:00:00',
                time_end: '15:00:00',
            }
        ],
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
        timetable: [
            {
                time_start: '13:00:00',
                time_end: '14:00:00',
            },
            {
                time_start: '14:00:00',
                time_end: '15:00:00',
            }
        ],
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
        timetable: {time_start: string, time_end: string}[]
        table: {time: number, price: number}[]
    } {
        const sch = schedule.find(e => e.variant_id == variant_id)
        return JSON.parse(JSON.stringify({
            // @ts-ignore
            timetable: sch.timetable,
            add_price: sch.add_price,
            table: sch.time_price[day_of_week]
        }))
    }

    selectTimetable(variant_id: number): {time_start: string, time_end: string}[] {
        const sch = schedule.find(e => e.variant_id == variant_id)
        return JSON.parse(JSON.stringify(sch.timetable))
    }
}


module.exports = new AvailableTime()