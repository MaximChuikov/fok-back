import jwt from 'jsonwebtoken'
import tokenDb from '../sql_requests/token'
import UserDto from "../dtos/user-dto";

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '80d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            // @ts-ignore
            const userData: UserDto = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            console.log('validate access', userData)
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            // @ts-ignore
            const userData: UserDto = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            console.log('validate refresh', userData)
            return userData;
        } catch (e) {
            return null;
        }
    }

    async saveToken(email, refreshToken) {
        return await tokenDb.saveToken(email, refreshToken)
    }

    async removeToken(refreshToken) {
        return tokenDb.removeToken(refreshToken)
    }

    async findToken(refreshToken) {
        return tokenDb.selectByToken(refreshToken)
    }
}

export default new TokenService();