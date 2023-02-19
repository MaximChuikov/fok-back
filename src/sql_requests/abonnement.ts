import {BookStatus, PrismaClient} from '@prisma/client'
import ApiError from "../exceptions/api-error";
import {AbonnementInfo} from "../types/types";

const prisma = new PrismaClient()

class DbAbonnement {
    async checkAbonnementDate(user_id: number, date: Date): Promise<boolean> {
        const abonnementInfo = await prisma.abonnement.findUnique({where: {user_id: user_id}})
        return abonnementInfo?.ends >= date ?? false;
    }
    async getAvailableHoursWithMonthAbonnement(user_id: number, date: Date): Promise<number> {
        const start = new Date(date.getTime())
        start.setHours(0,0,0)
        const end = new Date(date.getTime())
        end.setHours(23,59,59)
        const books = await prisma.book.findMany({
            where: {
                AND: [
                    {user_id: user_id},
                    {status: BookStatus.PAID},
                    {free_hours: {gte: 1}},
                    {start_time: {gte: start}},
                    {end_time: {lte: end}}
                ]
            }
        })
        return 2 - books.reduce((a, c) => a + c.free_hours, 0)
    }

    async checkAbonnementVisit(user_id: number): Promise<boolean> {
        const abonnementInfo = await prisma.abonnement.findUnique({where: {user_id: user_id}})
        return abonnementInfo?.visits_left >= 1 ?? false;
    }

    async selectAvailableVisits(user_id: number): Promise<number> {
        const abonnementInfo = await prisma.abonnement.findUnique({where: {user_id: user_id}})
        return abonnementInfo?.visits_left ?? 0
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

    async updateUserVisits(user_id: number, visits: number) {
        await prisma.abonnement.update({
            where: {user_id: user_id},
            data: {
                visits_left: visits
            }
        })
    }

    async userAbonnementInfo(user_id: number): Promise<AbonnementInfo> {
        if (await this.checkAbonnementVisit(user_id)) {
            const visits = await this.selectAvailableVisits(user_id)
            return {
                visits: visits
            }
        }
        else if (await this.checkAbonnementDate(user_id, new Date())) {
            const end = await prisma.abonnement.findUnique({
                where: {user_id: user_id}
            }).then(r => r.ends)
            return {
                ends: end
            }
        }
        else {
            return {}
        }
    }
}
export default new DbAbonnement()