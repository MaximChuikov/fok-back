import {pool} from '../database'

class Manager {
    async isManager(vk_id: number): Promise<boolean> {
        const r = await pool.query(`
            SELECT COUNT(*)
            FROM public.manager
            WHERE vk_id = ${vk_id}
        `).then(r => r.rows[0].count)
        return parseInt(r) === 1
    }

}

module.exports = new Manager()