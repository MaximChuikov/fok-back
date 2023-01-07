export class Schedule {
    fullDate: string = ""
    shortDate: string = ""
    schedule: {
        price: number
        time_start: Date
        time_end: Date
        info: {
            status: string
            isOver: boolean
            name?: string
            filled?: number
            capacity?: number
        }
    }[] = []
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