import {Request, Response, NextFunction} from 'express';
import ApiError from '../exceptions/api-error'
import bookDb from '../sql_requests/book'
import {BookRegistration} from "../types/types";
import {schedule} from '../service/day-of-week'

class BookController {
    async createBook(req: Request, res: Response, next: NextFunction) {
        try {
            const bookData: BookRegistration = req.body
            if (bookData.user_registered) {
                if (await bookDb.userWaitingBooks(bookData.user_id) <= 1) {
                    if (bookData.booking_list.length <= 4) {

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
            res.json(schedule(parseInt(req.params.week)))
        } catch (e) {
            next(e);
        }
    }
}

export default new BookController()