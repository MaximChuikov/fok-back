import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()

class Manager {
    async isManager(vk_id: number): Promise<boolean> {
        return 1 === await prisma.staff.count({
            where: {
                vk_id: vk_id
            }
        })
    }

}

module.exports = new Manager()