import {PrismaClient, Token} from '@prisma/client'
const prisma = new PrismaClient()

class DbToken {
    async saveToken(email: string, refresh_token: string): Promise<Token> {
        const tokenData = await prisma.token.findFirst({where: {user_email: email}})
        if (tokenData) {
            return await prisma.token.update({
                where: {user_email: email},
                data: {refresh_token: refresh_token}
            })
        }
        else {
            return await prisma.token.create({
                data: {
                    refresh_token: refresh_token,
                    user_email: email
                }
            })
        }
    }
    async removeToken(refresh_token: string) {
        return await prisma.token.deleteMany({
            where: {refresh_token: refresh_token}
        })
    }
    async selectByToken(refresh_token: string) {
        return await prisma.token.findFirst({
            where: {refresh_token: refresh_token}
        })
    }
}

export default new DbToken()