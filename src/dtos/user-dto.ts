import {User, Role} from "@prisma/client"

export default class UserDto {
    u_id: number
    active: boolean
    role: Role

    constructor(model: User) {
        this.u_id = model.user_id
        this.active = model.is_activated_email
        this.role = model.role
    }
}
