import eventDb from "../sql_requests/event";
import {FutureEvents} from "../types/types";

class EventService {
    async futureEvents(): Promise<FutureEvents> {
        const events = await eventDb.selectEventsInFuture()

        const now = new Date()

        const endOfDay = new Date(now)
        endOfDay.setHours(23, 59, 59)
        const oneWeek = new Date(endOfDay)
        oneWeek.setDate(oneWeek.getDate() + 7)
        const oneMonth = new Date(endOfDay)
        oneMonth.setDate(oneMonth.getDate() + 30)

        return [
            {
                title: "Проходят сегодня:",
                events: events.filter((e) => {return e.start_time <= endOfDay})
            },
            {
                title: "Пройдут в ближайшую неделю:",
                events: events.filter((e) => {return e.start_time > endOfDay && e.start_time <= oneWeek})
            },
            {
                title: "В ближайший месяц:",
                events: events.filter((e) => {return e.start_time > oneWeek && e.start_time <= oneMonth})
            },
            {
                title: "Остальные события:",
                events: events.filter((e) => {return e.start_time > oneMonth})
            }
        ]

    }
}

export default new EventService();