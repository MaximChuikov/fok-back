import {PrismaClient, Book} from '@prisma/client'
import {BookRegistration} from "../types/types";
import ApiError from "../exceptions/api-error";

const prisma = new PrismaClient()

class DbAbonnement {
    async checkAbonnementDate(user_id: number, date: Date): Promise<boolean> {
        const abonnementInfo = await prisma.abonnement.findUnique({where: {user_id: user_id}})
        return abonnementInfo?.ends <= date ?? false;
    }

    async checkAbonnementVisit(user_id: number): Promise<boolean> {
        const abonnementInfo = await prisma.abonnement.findUnique({where: {user_id: user_id}})
        return abonnementInfo?.visits_left >= 1 ?? false;
    }

    private async checkNewAbonnementAbility(user_id: number) {
        if (await this.checkAbonnementDate(user_id, new Date()))
            throw new ApiError(409, `У пользователя с id ${user_id} еще действует абонемент, купленный на 2 месяца.`)
        if (await this.checkAbonnementVisit(user_id))
            throw new ApiError(409, `У пользователя с id ${user_id} еще действует абонемент, купленный на 10 занятий.`)
    }

    async addTwoMonthAbonnement(user_id: number) {
        await this.checkNewAbonnementAbility(user_id)
        const now = new Date()
        const twoMonths = new Date(now.getTime())
        twoMonths.setMonth(twoMonths.getMonth() + 2)

        const newAbonnementData = {
            user_id: user_id,
            bought: now,
            ends: twoMonths
        }

        if (await prisma.abonnement.findUnique({where: {user_id: user_id}})) {
            await prisma.abonnement.update({
                where: {user_id: user_id},
                data: newAbonnementData
            })
        } else {
            await prisma.abonnement.create({
                data: newAbonnementData
            })
        }
    }

    async addTenVisitsAbonnement(user_id: number) {
        await this.checkNewAbonnementAbility(user_id)

        const newAbonnementData = {
            user_id: user_id,
            bought: new Date(),
            visits: 10
        }

        if (await prisma.abonnement.findUnique({where: {user_id: user_id}})) {
            await prisma.abonnement.update({
                where: {user_id: user_id},
                data: newAbonnementData
            })
        } else {
            await prisma.abonnement.create({
                data: newAbonnementData
            })
        }
    }
}
export default new DbAbonnement()