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

class Schedule {
    fullDate: string = ""
    shortDate: string = ""
    schedule: {
        time_start: string
        time_end: string
        info: {
            status: string
            isOver: boolean
            name: string | null
        }
    }[] = []
}