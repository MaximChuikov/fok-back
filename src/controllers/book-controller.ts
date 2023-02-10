import {Request, Response, NextFunction} from 'express';
import ApiError from '../exceptions/api-error'
import bookDb from '../sql_requests/book'
import {BookRegistration} from "../types/types";
import {schedule} from '../service/day-of-week'
import book from "../sql_requests/book";

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
            const day = req.query.day
            // @ts-ignore
            res.json(await schedule(parseInt(day)))
        } catch (e) {
            next(e);
        }
    }

    async deleteBook(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-ignore
            await bookDb.deleteBook(parseInt(req.query.book_id))
        } catch (e) {
            next(e);
        }
    }
}

export default new BookController()