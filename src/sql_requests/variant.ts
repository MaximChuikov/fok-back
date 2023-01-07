import {PrismaClient, Hall, Variant} from '@prisma/client'
const prisma = new PrismaClient()

class DbVariant {
    async selectVariant(variant_id: number): Promise<Variant> {
        return await prisma.variant.findUnique({
            where: {variant_id: variant_id}
        })
    }

    async selectHall(variant_id: number): Promise<Hall> {
        return await prisma.variant.findUnique({
            where: {variant_id: variant_id},
            select: {hall: true}
        }).then(r => r.hall)
    }
}

module.exports = new DbVariant()