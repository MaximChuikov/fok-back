const axios = require("axios");
const managers_ids = [206186509]//
class AuthorizationController{
    async vk_auth (req, res, next) {
        try{
            const authHeader = req.headers.authorization
            if (!authHeader)
                res.status(501).end("No Authorization header")
            else{
                const url = `https://api.vk.com/method/secure.checkToken?token=${authHeader}&access_token=776291817762918177629181397472ed1377762776291811469c49e559114640fa4541e&v=5.131`
                await axios.get(url).then(r => {
                    if (r.data.error) {
                        res.status(401).send(r.data.error)
                    }
                    else{
                        req.vk_id = r.data.response.user_id
                        next()
                    }

                })
            }
        }catch (e){
            res.status(500).end(e.message)
        }
    }

    manager_auth(req, res, next){
        console.log(req.vk_id, 'vk_id')
        console.log(managers_ids.includes(req.vk_id), 'includes?')
        if (managers_ids.includes(req.vk_id)){
            next()
        }
        else{
            res.status(401).send('You are not a manager')
        }
    }
}
module.exports = new AuthorizationController()