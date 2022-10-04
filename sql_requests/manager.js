const db = require('../database')

class Manager {
    async isManager(vk_id) {
        try {
            const res = await db.query(`
                SELECT COUNT(*)
                FROM public.manager
                WHERE vk_id = ${vk_id}
            `).then(r => r !== 0)
            return [true, res]
        } catch (e) {
            console.log(e)
            return [false, null];
        }
    }

}

module.exports = new Manager()