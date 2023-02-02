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

export type EventData = {
    end_time: Date,
    start_time: Date,
    event_description: string,
    publication_date_title: string
}

export type UserRegistrationData = {
    email: string,
    password_hash: string,
    activation_link: string,
    user_name: string,
    user_surname: string,
    phone_number: string
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
    }[]
    payment_data: Prisma.JsonValue
}

export type FutureEvents = {
    title: string,
    events: Event[]
}[]
