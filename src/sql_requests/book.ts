import {PrismaClient} from '@prisma/client'
import {BookRegistration} from "../types/types";

const prisma = new PrismaClient()

class DbBook {
    async createBook(data: BookRegistration) {
        const {start_time} = data.booking_list[0]
        const {end_time} = data.booking_list[data.booking_list.length - 1]
        data.start_time = start_time
        data.end_time = end_time
        await prisma.book.create({data: data})
    }

    async bookedCount(start: Date, end: Date) {
        return await prisma.book.count({
            where: {
                AND: [
                    {start_time: start},
                    {end_time: end}
                ]
            }
        })
    }

    async deleteBook(book_id: number) {
        await prisma.book.delete({where: {book_id: book_id}})
    }

    async userWaitingBooks(user_id: number) {
        const now = new Date()
        return prisma.book.count({
            where: {
                AND: [
                    {end_time: {gt: now}},
                    {user_id: user_id}
                ]
            }
        })
    }
}

export default new DbBook()