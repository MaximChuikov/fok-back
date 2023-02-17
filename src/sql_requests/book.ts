import {PrismaClient, BookStatus} from '@prisma/client'
import {BookRegistration} from "../types/types";

const prisma = new PrismaClient()

class DbBook {
    async createBook(data: BookRegistration) {
        await prisma.book.create({
            data: {
                free_hours: data.free_hours,
                start_time: data.start_time,
                end_time: data.end_time,
                user_id: data.user_id,
                payed_hours: data.payed_hours,
                user_registered: data.user_registered,
                non_reg_user_name: data.non_reg_user_name
            }
        })
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

    async userWaitingBooks(user_id: number): Promise<number> {
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

    async userBooks(user_id: number) {
        return await prisma.book.findMany({
            where: {
                AND: [
                    {user_id: user_id},
                    {end_time: {gte: new Date()}}
                ]
            }
        })
    }

    async timeFullInfo(start_time: Date, end_time: Date) {
        return await prisma.book.findMany({
            where: {
                AND: [
                    {end_time: {gte: end_time}},
                    {start_time: {lte: start_time}}
                ]
            }
        })
    }
    async bookById(book_id: number) {
        return await prisma.book.findUnique({where: {book_id: book_id}})
    }
    async applyBook(book_id: number) {
        await prisma.book.update({
            where: {book_id: book_id},
            data: {status: BookStatus.PAID}
        })
    }

}

export default new DbBook()