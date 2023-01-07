import {Hall, Reason, PrismaClient, Event as PrismaEvent} from '@prisma/client'
const prisma = new PrismaClient()

class Event {
    async addNewEvent(start: Date, end: Date, name: string, hall: Hall, reason: Reason): Promise<void> {
        await prisma.event.create({
            data: {
                name: name,
                hall: hall,
                full_start: start,
                full_end: end,
                reason: reason
            }
        })
    }

    async deleteEvent(event_id: number): Promise<void> {
        await prisma.event.delete({
            where: {
                event_id: event_id
            }
        })
    }

    /*
        @param date Find 0:00 and 23:59, and finding requests
     */
    async selectEvents(hall: Hall, date: Date): Promise<PrismaEvent[]> {
        const morning = new Date(date.getTime())
        morning.setHours(0, 0, 0)
        const evening = new Date(date.getDate())
        evening.setHours(23, 59, 59)

        return  await prisma.event.findMany({
            where: {
                AND: [
                    {full_start: {lte: evening}},
                    {full_end: {gte: morning}}
                ]
            }
        })
    }

    async selectAllEvents(hall: Hall): Promise<PrismaEvent[]> {
        return await prisma.event.findMany({
            where: {
                hall: hall
            }
        })

    }
}

module.exports = new Event()