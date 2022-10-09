import axios from "axios";
import {NextFunction, Request, Response} from "express";

export async function tryAuth (req: Request, res: Response, next: NextFunction, token) {
    const url = `https://api.vk.com/method/secure.checkToken?token=${token}&access_token=776291817762918177629181397472ed1377762776291811469c49e559114640fa4541e&v=5.131`
    await axios.get(url).then((r: { data: { error: any; response: { user_id: number; }; }; }) => {
        if (r.data.error) {
            res.status(401).send(r.data.error)
        } else {
            req.vk_id = r.data.response.user_id
            next()
        }
    })
}