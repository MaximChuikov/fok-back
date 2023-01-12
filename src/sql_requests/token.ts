import {PrismaClient, Token} from '@prisma/client'
const prisma = new PrismaClient()

class DbToken {
    async saveToken(user_id: number, refresh_token: string): Promise<Token> {
        const tokenData = await prisma.token.findUnique({where: {user_id: user_id}})
        if (tokenData) {
            return await prisma.token.update({
                where: {user_id: user_id},
                data: {refresh_token: refresh_token}
            })
        }
        else {
            return await prisma.token.create({
                data: {
                    user_id: user_id,
                    refresh_token: refresh_token
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