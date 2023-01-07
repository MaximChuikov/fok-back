import bcrypt from 'bcrypt'
import {v4} from 'uuid'
import tokenService from './token-service'
import userDb from '../sql_requests/user'
import ApiError from '../exceptions/api-error'
import UserDto from '../dtos/user-dto'
import {UserRegistrationData} from '../types/types'

const mailService = require('./mail-service');

class UserService {
    async registration(userData: UserRegistrationData, password: string) {
        const candidate = await userDb.findUser(userData.email)
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${userData.email} уже существует`)
        }
        userData.password_hash = await bcrypt.hash(password, 3);
        userData.activation_link = v4();


        const user = await userDb.addUser(userData)
        await mailService.sendActivationMail(userData.email, `${process.env.API_URL}/api/activate/${userData.activation_link}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(user.email, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async activate(activationLink: string) {
        const user = await userDb.getUserByLink(activationLink)
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации почтового ящика')
        }
        await userDb.activateUser(user)
    }

    async login(email, password) {
        const user = await userDb.findUser(email)
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password_hash);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(user.email, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await userDb.findUser(userData.email);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(user.email, tokens.refreshToken);
        return {...tokens, user: userDto}
    }
}

export default new UserService();
