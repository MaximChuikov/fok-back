class Schedule {
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