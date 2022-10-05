const axios = require('axios')

class Group{
    async sendMessageFromGroup(message: string, vk_id: number): Promise<boolean>{
        try{
            const random = Math.random()
            const url = `https://api.vk.com/method/messages.send?peer_id=${vk_id}&message=${message}
            &random_id=${random}&intent=default&access_token=${process.env.group_access_token}&v=5.131`
            const r = await axios.get(url).then((r: { data: any }) => r.data)
            return r.response > 0
        } catch (e){
            return false
        }


    }
}
module.exports = new Group()