const axios = require("axios");

class AuthorizationController{
    async vk_auth (req, res, next) {
        try{
            const authHeader = req.headers.authorization
            console.log(authHeader)
            if (!authHeader)
                res.status(501).end("No Authorization header")
            else{
                const url = `https://api.vk.com/method/secure.checkToken?token=${authHeader}&access_token=776291817762918177629181397472ed1377762776291811469c49e559114640fa4541e&v=5.131`
                await axios.get(url).then(r => {
                    if (r.data.error) {
                        res.status(300).send(r.data.error)
                    }
                    else{
                        req.vk_id = r.data.response
                        next()
                    }

                }).catch(e => {
                    res.statusCode(350).end('Непредвиденная ошибка с вашей стороны' + e)
                })
            }
        }catch (e){
            res.status(500).end(e.message)
        }
    }
}
module.exports = new AuthorizationController()