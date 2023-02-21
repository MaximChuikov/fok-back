import {BookStatus, PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()

async function each_hour() {
    const now = new Date()
    const hourAgo = new Date(now.getTime() - 1000 * 60 * 60)
    //   12 --- 14 book, 14:01 script, 13:01 < 14:00 <= 14:01 -> missed
    const missed = await prisma.book.findMany({
        select: {user_id: true},
        where: {
            AND: [
                {end_time: {lte: now}},
                {end_time: {gt: hourAgo}},
                {status: BookStatus.PAYMENT_EXPECTED}
            ]
        }
    })

    for (const {user_id} of missed) {
        await prisma.user.update({
            where: {user_id: user_id},
            data: {
                missed: {increment: 1}
            }
        })
    }

}
each_hour().then()
