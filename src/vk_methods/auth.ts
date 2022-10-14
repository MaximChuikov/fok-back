import axios from "axios";
import {NextFunction, Request, Response} from "express";

const url = (token) => `https://api.vk.com/method/secure.checkToken?token=${token}&access_token=776291817762918177629181397472ed1377762776291811469c49e559114640fa4541e&v=5.131`

export async function tryAuth (req: Request, res: Response, next: NextFunction, token) {
    const [stat, data] = await auth(token)
    if (stat) {
        req.vk_id = data
        next()
    } else {
        res.status(401).send(data)
    }
}

export async function auth(token): Promise<[boolean, any]> {
    return await axios.get(url(token)).then((r: { data: { error: any; response: { user_id: number; }; }; }) => {
        if (r.data.error) {
            return [false, r.data.error]
        } else {
            return [true, r.data.response.user_id]
        }
    })
}