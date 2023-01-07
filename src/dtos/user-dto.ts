import {User} from "@prisma/client"

export default class UserDto {
    email: string
    user_name: string
    user_surname: string
    phone_number: string
    is_activated_email: boolean

    constructor(model: User) {
        this.email = model.email
        this.user_name = model.user_name
        this.user_surname = model.user_surname
        this.phone_number = model.phone_number
        this.is_activated_email = model.is_activated_email
    }
}
