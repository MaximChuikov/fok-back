import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator'
import ApiError from "../exceptions/api-error";

export function check(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        throw ApiError.BadRequest('Некорректные данные', errors.array());
    next()
}