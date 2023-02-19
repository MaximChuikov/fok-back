import {PrismaClient, User} from '@prisma/client'
import {UserRegistrationData} from "../types/types";
const prisma = new PrismaClient()

class DbUser {
    async findUser(email: string): Promise<User> {
        return await prisma.user.findUnique({where: {email: email}})
    }
    async findUserById(user_id: number): Promise<User> {
        return await prisma.user.findUnique({where: {user_id: user_id}})
    }
    async addUser(data: UserRegistrationData) {
        return await prisma.user.create({
                data: data
            })
    }
    async getUserByLink(activation_link: string) {
        return await prisma.user.findUnique({
            where: {
                activation_link: activation_link
            }
        })
    }
    async activateUser(user: User) {
        await prisma.user.update({
            where: {user_id: user.user_id},
            data: {is_activated_email: true}
        })
    }
    async userMissed(u_id: number): Promise<number> {
        return await prisma.user.findUnique({
            select: {missed: true},
            where: {user_id: u_id}
        }).then(r => r.missed)
    }

    async zeroUserMisses(u_id) {
        await prisma.user.update({
            where: {user_id: u_id},
            data: {
                missed: 0
            }
        })
    }
}

export default new DbUser()