class UserController{
    async getUserInfo(req, res){
        res.send({
            hi: "220221asdasd",
            your_data: req.vk_id
        })
    }
    async getBooked(req, res){
        throw Error
    }
    async postBookRequest(res, req){

    }
}

module.exports = new UserController()