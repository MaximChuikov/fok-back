import {PrismaClient, User} from '@prisma/client'
import {UserRegistrationData} from "../types/types";
const prisma = new PrismaClient()

class DbUser {
    async findUser(email: string): Promise<User> {
        return await prisma.user.findFirst({where: {email: email}})
    }
    async addUser(data: UserRegistrationData) {
        return await prisma.user.create({
                data: data
            })
    }
    async getUserByLink(activation_link: string) {
        return await prisma.user.findFirst({
            where: {
                activation_link: activation_link
            }
        })
    }
    async activateUser(user: User) {
        await prisma.user.update({
            where: {email: user.email},
            data: {is_activated_email: true}
        })
    }
}

export default new DbUser()