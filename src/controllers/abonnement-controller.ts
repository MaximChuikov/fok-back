import {Request, Response, NextFunction} from 'express';
import abonnement from "../sql_requests/abonnement";
import ApiError from "../exceptions/api-error";

class AbonnementController {

    async assignTenVisits(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = parseInt(req.query.user_id as string)
            await abonnement.addTenVisitsAbonnement(user_id)
        } catch (e) {
            next(e);
        }
    }
    async assignTwoMonths(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = parseInt(req.query.user_id as string)
            await abonnement.addTwoMonthAbonnement(user_id)
        } catch (e) {
            next(e);
        }
    }
    async myAbonnementInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user.u_id
            res.json(await abonnement.userAbonnementInfo(user_id))
        } catch (e) {
            next(e);
        }
    }
    async userAbonnementInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = parseInt(req.query.user_id as string)
            res.json(await abonnement.userAbonnementInfo(user_id))
        } catch (e) {
            next(e);
        }
    }
    async decreaseUserVisits(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = parseInt(req.query.user_id as string)
            const visits = parseInt(req.query.visits as string)
            if (await abonnement.checkAbonnementVisit(user_id))
                throw new ApiError(409, `У пользователя нет абонемента на посещения`)
            const av_visits = await abonnement.selectAvailableVisits(user_id)
            if (av_visits < visits)
                throw new ApiError(409, `У пользователя с id ${user_id} доступное кол-во посещений ${av_visits}, 
            нельзя уменьшить на ${visits}`)
            await abonnement.updateUserVisits(user_id, av_visits - visits)
        } catch (e) {
            next(e);
        }
    }
}

export default new AbonnementController()