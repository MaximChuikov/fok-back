import {NextFunction, Request, Response} from 'express';
import ApiError from '../exceptions/api-error'
import bookDb from '../sql_requests/book'
import DbBook from '../sql_requests/book'
import {BookRegistration, PayInfo} from "../types/types";
import {schedule} from '../service/schedule'
import abonnement from "../sql_requests/abonnement";
import userService from "../service/user-service";
import Abonnement from "../sql_requests/abonnement";

class BookController {
    async createBook(req: Request, res: Response, next: NextFunction) {
        try {
            const bookData: BookRegistration = req.body
            if (bookData.user_registered) {
                bookData.user_id = req.user.u_id
                if (await bookDb.userWaitingBooks(bookData.user_id) === 0) {
                    if (bookData.booking_list.length <= 4) {
                        bookData.booking_list.forEach(e => {
                            e.start_time = new Date(e.start_time)
                            e.end_time = new Date(e.end_time)
                        })
                        bookData.start_time =
                            bookData.booking_list.map(e => e.start_time).reduce(function (a, b) { return a < b ? a : b; })
                        bookData.end_time =
                            bookData.booking_list.map(e => e.end_time).reduce(function (a, b) { return a > b ? a : b; })

                        const missed = await userService.userMissed(req.user.u_id)
                        if (missed >= 3)
                            throw ApiError.BadRequest('Вы не пришли на забронированное время 3 раза. ' +
                                'Разблокировать возможность брони можно только в ФОКе.')

                        for (const e of bookData.booking_list) {
                            const count = await DbBook.bookedCount(e.start_time, e.end_time)
                            if (count >= 15)
                                throw ApiError.BadRequest(`На время ${e.start_time.toLocaleTimeString()} - `
                                + `${e.end_time.toLocaleTimeString()} уже занято максимальное кол-во человек. Мы не можем принять бронь`)
                        }

                        const userBooks = await DbBook.userWaitingBooks(req.user.u_id)
                        if (userBooks >= 1)
                            throw ApiError.BadRequest('Вы не можете создать более одной броней.')

                        await DbBook.createBook(bookData)
                        res.json({result: true})
                    }
                    else {
                        throw ApiError.BadRequest('Можно бронировать не более 4 часов')
                    }
                }
                else {
                    throw ApiError.BadRequest('У вас уже есть активная бронь')
                }
            }
        } catch (e) {
            next(e);
        }
    }

    async adminCreateBook(req: Request, res: Response, next: NextFunction) {
        try {
            const bookData: BookRegistration = req.body
            bookData.booking_list.forEach(e => {
                e.start_time = new Date(e.start_time)
                e.end_time = new Date(e.end_time)
            })
            bookData.start_time =
                bookData.booking_list.map(e => e.start_time).reduce(function (a, b) { return a < b ? a : b; })
            bookData.end_time =
                bookData.booking_list.map(e => e.end_time).reduce(function (a, b) { return a > b ? a : b; })

            await DbBook.createBook(bookData)
            res.json({result: true})
        } catch (e) {
            next(e);
        }
    }

    async getTable(req: Request, res: Response, next: NextFunction) {
        try {
            const day = parseInt(req.query.day as string)
            const sch = await schedule(day)
            const date = new Date()
            date.setDate(date.getDate() + day)
            const {u_id} = req.user

            const pay_info: PayInfo = {
                free_hours: 0,
                payed_hours: 4
            }
            if (await abonnement.checkAbonnementDate(u_id, date)) {
                const free = await abonnement.getAvailableHoursWithMonthAbonnement(u_id, date)
                pay_info.free_hours = free
                pay_info.payed_hours = 4 - free
            }
            else if (await abonnement.checkAbonnementVisit(u_id)) {
                let visits = await abonnement.selectAvailableVisits(u_id)
                visits = visits > 4 ? 4 : visits
                pay_info.free_hours = visits
                pay_info.payed_hours -= visits
            }
            res.json({
                pay_info: pay_info,
                schedule: sch
            })
        } catch (e) {
            next(e);
        }
    }

    async myBooks(req: Request, res: Response, next: NextFunction) {
        try {
            res.json(await bookDb.userBooks(req.user.u_id))
        } catch (e) {
            next(e);
        }
    }

    //TODO: 2
    async getFullInfoAboutTimeBooks(req: Request, res: Response, next: NextFunction) {
        try {
            const start_time = new Date(req.query.time_start as string)
            const time_end = new Date(req.query.time_end as string)
            const book_info = await bookDb.timeFullInfo(start_time, time_end)
            for (const e of book_info) {
                if (e.free_hours > 0) {
                    // @ts-ignore
                    e.abonnement = await abonnement.userAbonnementInfo(e.user_id)
                }
            }
            res.json(book_info)
        } catch (e) {
            next(e);
        }
    }

    //TODO: 1
    async applyBook(req: Request, res: Response, next: NextFunction) {
        try {
            const book_id = parseInt(req.query.book_id as string)
            const book_info = await bookDb.bookById(book_id)
            const {user_id, user_registered} = book_info

            if (user_registered) {
                const abonnement = await Abonnement.userAbonnementInfo(user_id)
                if (abonnement?.visits ?? 0 >= book_info.free_hours) {
                    await Abonnement.updateUserVisits(user_id, abonnement.visits - book_info.free_hours)
                }
                else if (abonnement.ends == null){
                    throw ApiError.BadRequest("Недостаточно бесплатных посещений для снятия! " +
                        `У пользователя ${abonnement?.visits ?? 0} часов, нужно ${book_info.free_hours}`)
                }
                await userService.zeroUserMisses(user_id)
            }
            await bookDb.applyBook(book_id)
            res.json('Бронь успешно принята.')
        } catch (e) {
            next(e);
        }
    }

    //TODO: 3
    async cancelBook(req: Request, res: Response, next: NextFunction) {
        try {
            const now = new Date()
            const hourAhead = new Date(now.getTime() + 3600*1000)

            const book_id = parseInt(req.query.book_id as string)
            const {start_time} = await bookDb.bookById(book_id)
            if (start_time >= hourAhead) {
                await bookDb.deleteBook(book_id)
                res.json("Бронь успешно отменена.")
            }
            else {
                throw ApiError.BadRequest('Нельзя отменить бронь менее чем за час до начала.')
            }
        }catch (e) {
            next(e);
        }
    }
    async adminCancelBook(req: Request, res: Response, next: NextFunction) {
        try {
            const book_id = parseInt(req.query.book_id as string)
            await bookDb.deleteBook(book_id)
            res.json("Бронь успешно отменена.")
        }catch (e) {
            next(e);
        }
    }
}

export default new BookController()