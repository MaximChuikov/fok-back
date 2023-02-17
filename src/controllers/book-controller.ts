import {NextFunction, Request, Response} from 'express';
import ApiError from '../exceptions/api-error'
import bookDb from '../sql_requests/book'
import DbBook from '../sql_requests/book'
import {BookRegistration, PayInfo} from "../types/types";
import {schedule} from '../service/schedule'
import abonnement from "../sql_requests/abonnement";
import book from "../sql_requests/book";

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

                        const userAbonnement = await abonnement.userAbonnementInfo(req.user.u_id)
                        const userBooks = await DbBook.userBooks(bookData.user_id)
                        userBooks.forEach((e) => {
                            if (e.end_time > bookData.start_time && e.start_time < bookData.end_time)
                                throw ApiError.BadRequest('Вы уже забронировали зал на это время.')
                        })

                        // if (userAbonnement.ends && bookData.free_hours > 0 && (userAbonnement?.visits === 0 ?? true)) {
                        //     userBooks.map(e => e.start_time.toDateString()).forEach((e) => {
                        //
                        //     })
                        // }


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



                pay_info.free_hours = 2
                pay_info.payed_hours = 2
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

    async deleteBook(req: Request, res: Response, next: NextFunction) {
        try {
            await bookDb.deleteBook(parseInt(req.query.book_id as string))
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

    async applyBook(req: Request, res: Response, next: NextFunction) {
        try {
            const book_id = parseInt(req.query.book_id as string)
            const book_info = await bookDb.bookById(book_id)


            await bookDb.applyBook(book_id)
        } catch (e) {
            next(e);
        }
    }
}

export default new BookController()