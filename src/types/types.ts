import {Prisma, Event} from "prisma";

export type Schedule = {
    shortDate: string
    schedule: {
        price: number
        time_start: Date
        time_end: Date
        info: {
            status: string
            isOver: boolean
            filled: number
            capacity: number
        }
    }[]
}

export type Timetable = {
    time_start: Date,
    time_end: Date,
    price: number
}[]

export type PayInfo = {
    free_hours: number,
    payed_hours: number
}

export type AbonnementInfo = { visits: number, ends?: undefined } |
    { ends: Date, visits?: undefined} |
    {visits?: undefined, ends?: undefined}

export type EventData = {
    end_time: Date,
    start_time: Date,
    event_description: string,
    publication_date_title: string
}

export type UserRegistrationData = {
    email: string,
    password_hash: string,
    activation_link: string
}

export type BookRegistration = {
    user_registered: boolean
    user_id: number | null
    non_reg_user_name: string | null
    start_time: Date | null
    end_time: Date | null
    booking_list: {
        start_time: Date
        end_time: Date
    }[],
    free_hours: number,
    payed_hours: number
}

export type FutureEvents = {
    title: string,
    events: Event[]
}[]
