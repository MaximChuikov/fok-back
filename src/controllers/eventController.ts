import {Request, Response, NextFunction} from 'express';
import ApiError from '../exceptions/api-error'
import eventDb from '../sql_requests/event'
import eventService from '../service/event-service'

class EventController {
    async addEvent(req: Request, res: Response, next: NextFunction) {
        try {
            await eventDb.addNewEvent(req.body)
            res.status(200)
        } catch (e) {
            next(e);
        }
    }

    async deleteEvent(req: Request, res: Response, next: NextFunction) {
        try {
            await eventDb.deleteEvent(parseInt(req.params.event_id))
            res.status(200)
        } catch (e) {
            next(e);
        }
    }

    async selectNearestEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const events = await eventDb.selectNearestEvents()
            res.json(events)
        } catch (e) {
            next(e);
        }
    }

    async selectFutureEvents(req: Request, res: Response, next: NextFunction) {
        try {
            res.json(await eventService.futureEvents())
        } catch (e) {
            next(e);
        }
    }

    async selectArchiveEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const from = new Date(req.params.from)
            const to = new Date(req.params.to)
            if (from > to)
                throw ApiError.BadRequest('Неверно указан промежуток поиска')
            const events = await eventDb.selectEventsInTimeSpan(from, to)
            res.json(events)
        } catch (e) {
            next(e);
        }
    }

}

export default new EventController()