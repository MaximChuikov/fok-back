const schedule = [
    //variant_id
    {
        //футбол весь зал
        variant_id: 1,
        timetable: [
            {
                time_start: '8:00',
                time_end: '8:55',
            },
            {
                time_start: '9:00',
                time_end: '9:55',
            },
            {
                time_start: '10:00',
                time_end: '10:55',
            },
            {
                time_start: '11:00',
                time_end: '11:55',
            },

        ],
        //воскр, понед, ..., субб

        time_price: [
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
            [],
            [],
            [],
            [],
            [],
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
        ]
    },
    {
        //футбол случ. состав
        variant_id: 2,
        timetable: [
            {
                time_start: '10:00',
                time_end: '10:55',
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
                    price: 150
                }
            ],
        ]
    },
    {
        //баскет весь зал
        variant_id: 3,
        timetable: [
            {
                time_start: '8:00',
                time_end: '8:55',
            },
            {
                time_start: '9:00',
                time_end: '9:55',
            },
            {
                time_start: '10:00',
                time_end: '10:55',
            },
            {
                time_start: '11:00',
                time_end: '11:55',
            },

        ],

        time_price: [
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
            [],
            [],
            [],
            [],
            [],
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
        ]
    },
    {
        //баскет случ. состав
        variant_id: 4,
        timetable: [
            {
                time_start: '10:00',
                time_end: '10:55',
            }
        ],
        time_price: [
            [
                {
                    time: 0,
                    price: 150
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
        timetable: [
            {
                time_start: '8:00',
                time_end: '8:55',
            },
            {
                time_start: '9:00',
                time_end: '9:55',
            },
            {
                time_start: '10:00',
                time_end: '10:55',
            },
            {
                time_start: '11:00',
                time_end: '11:55',
            },

        ],
        time_price: [
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
            [
                {
                    time: 0,
                    price: 150
                },
                {
                    time: 1,
                    price: 150
                },
                {
                    time: 2,
                    price: 150
                },
                {
                    time: 3,
                    price: 150
                }
            ],
        ]
    }
]


class AvailableTime {
    selectAvailableTime(variant_id: number, day_of_week: number): {
        timetable: {time_start: string, time_end: string}[]
        table: {time: number, price: number}[]
    } {
        const sch = schedule.find(e => e.variant_id == variant_id)
        return JSON.parse(JSON.stringify({
            // @ts-ignore
            timetable: sch.timetable,
            table: sch.time_price[day_of_week]
        }))
    }

    selectTimetable(variant_id: number): {time_start: string, time_end: string}[] {
        const sch = schedule.find(e => e.variant_id == variant_id)
        return JSON.parse(JSON.stringify(sch.timetable))
    }
}


module.exports = new AvailableTime()