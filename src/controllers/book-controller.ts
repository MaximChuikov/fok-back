import {Request, Response, NextFunction} from 'express';
import ApiError from '../exceptions/api-error'
import bookDb from '../sql_requests/book'
import {PayInfo, BookRegistration} from "../types/types";
import {schedule} from '../service/schedule'
import book from "../sql_requests/book";
import abonnement from "../sql_requests/abonnement";

class BookController {
    async createBook(req: Request, res: Response, next: NextFunction) {
        try {
            const bookData: BookRegistration = req.body
            if (bookData.user_registered) {
                if (await bookDb.userWaitingBooks(bookData.user_id) <= 1) {
                    if (bookData.booking_list.length <= 4) {
                        await book.createBook(bookData)
                    }
                    else {
                        throw ApiError.BadRequest('Можно бронировать не более 4 часов')
                    }
                }
                else {
                    throw ApiError.BadRequest('Нельзя создавать более двух броней')
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
            if (await abonnement.checkAbonnementVisit(u_id)) {
                let visits = await abonnement.selectAvailableVisits(u_id)
                visits = visits > 4 ? 4 : visits
                pay_info.free_hours = visits
                pay_info.payed_hours -= visits
            }
            else if (await abonnement.checkAbonnementDate(u_id, date)) {
                pay_info.free_hours = 2
                pay_info.payed_hours = 2
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
}

export default new BookController()