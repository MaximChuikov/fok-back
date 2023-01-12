import {Role} from '@prisma/client'

export default class ApiError extends Error {
    status;
    errors;
    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError(): ApiError {
        return new ApiError(401, 'Пользователь не авторизован')
    }

    static BadRequest(message, errors = []): ApiError {
        return new ApiError(400, message, errors);
    }

    static InsufficientRole(necessary_role: Role) {
        return new ApiError(403, 'У вас недостаточно прав, для доступа необходима роль ' + necessary_role)
    }

}