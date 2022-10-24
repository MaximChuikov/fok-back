interface Timestamp {
    start: Date
    end: Date
}

interface Time {
    start: string
    end: string
}

interface DateTime extends Time {
    price: any
    date: Date
}

interface TimePrice {
    time_start: string,
    time_end: string,
    price: number
}

class Schedule {
    fullDate: string = ""
    shortDate: string = ""
    schedule: {
        price: number;
        time_start: string
        time_end: string
        info: {
            status: string
            isOver: boolean
            name: string | undefined
            filled: number | undefined
            capacity: number | undefined
        }
    }[] = []
}