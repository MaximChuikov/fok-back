import {Hall, PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()

class AdditionalTime {
    async createAddTime(hall: Hall, start: Date, end: Date): Promise<void> {
        await prisma.add_time.create({
            data: {
                hall: hall,
                full_start: start,
                full_end: end
            }
        })
    }

    /*
        @param date Find 0:00 and 23:59, and finding add time
        @return time from sessions where is add_time
     */
    async selectAddTime(hall: Hall, settlementSessions: {start: Date, end: Date}[]): Promise<{ start: Date, end: Date }[]> {
        let result: {start: Date, end: Date}[] = []
        for (const x of settlementSessions) {
            const allAddTimes = await prisma.add_time.findMany({
                where: {
                    AND: [
                        {full_start: {lt: x.end}},
                        {full_end: {gt: x.start}},
                        {hall: hall}
                    ]
                }
            })
            if (allAddTimes.length >= 1) {
                result.push(x)
            }
        }
        return result
    }
}
module.exports = new AdditionalTime()