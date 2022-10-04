const db = require('../../database')
const emitter = require('../../service/event-bus');
const vk_methods = require('../../vk_methods/group')
const db_manager = require('../../sql_requests/manager')
const db_request = require('../../sql_requests/request')
class ManagerController{
    async isManager(req, res) {
        const [ok, who] = await db_manager.isManager(req.vk_id)
        if (ok)
            res.send(who)
        else
            res.status(500).send('Error, sorry')
    }

    async rentRequests(req, res) {
        try {
            const variant_id = req.query.variant_id
            const [ok, r] = await db_request.selectRequests(variant_id, 1)
            if (ok) {
                r.forEach(x => {
                    x.vk_url = `https://vk.com/id${x.user_vk_id}`
                    delete x.user_vk_id
                })
                res.send(r)
            }
            else{
                res.status(500).send('Db error')
            }

        } catch (e) {
            res.status(500).send(e.message)
        }
    }
    async denyRentRequest(req, res){
        try {
            const request_id = req.query.request_id
            const text = req.body
            const [ok, vk_id] = await db_request.deleteRequest()
            if (ok) {
                await vk_methods.sendMessageFromGroup(
                    `К сожалению, ваша бронь №${request_id} отклонена.` + text && `\nПричина: ${text}`,
                    vk_id
                )
                res.send("ok")
            }
            else{
                res.status(500).send("Error in db")
            }
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
    async acceptRentRequest(req, res){
        try {
            const request_id = req.query.request_id
            const ok = await db_request.acceptRequest(request_id)
            if (ok) {
                await vk_methods.sendMessageFromGroup('Ваша заявка принята, ждем вас', request_data.user_vk_id)
                emitter.emit('new-successful-request', request_data)
                res.send('ok')
            }
            else
                res.status(500).send('Error in db')

        } catch (e) {
            res.status(500).send(e.message)
        }
    }
    async deleteSuccessfulRequest(req, res) {
        try{
            const request_id = req.params.request_id
            const [ok, ] = await db_request.deleteRequest(request_id)
            if (ok) {
                emitter.emit('deleted-book', request_id)
            }
        } catch (e) {
            res.status(500).send(e.message)
        }
    }
}

module.exports = new ManagerController()