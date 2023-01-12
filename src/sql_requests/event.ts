import {PrismaClient, Event} from '@prisma/client'
import {EventData} from "../types/types";
const prisma = new PrismaClient()

class DbEvent {
    async addNewEvent(data: EventData): Promise<void> {
        await prisma.event.create({
                data: data
            }
        )
    }

    async deleteEvent(event_id: number): Promise<void> {
        await prisma.event.delete({
            where: {
                event_id: event_id
            }
        })
    }

    async selectNearestEvents(): Promise<Event[]> {
        const now = new Date()
        const oneWeekAhead = new Date(now.getTime())
        oneWeekAhead.setDate(oneWeekAhead.getDate() + 7)
        return await prisma.event.findMany({
            where: {
                AND: [
                    {start_time: {gte: now}},
                    {start_time: {lte: oneWeekAhead}}
                ]
            },
            take: 3
        })
    }

    async selectArchiveEvents(from?: Date, to?: Date): Promise<Event[]> {
        if (!from) {
            from = new Date()
            from.setDate(from.getDate() - 31)
        }
        to = to ?? new Date()
        return await prisma.event.findMany({
            where: {
                AND: [
                    {start_time: {gte: from}},
                    {end_time: {lte: to}}
                ]
            }
        })
    }
}

export default new DbEvent()