import {pool} from '../database'

class AvailableTime {
    async selectAvailableTime(variant_id: number): Promise<Time[]> {
        return await pool.query(`
                SELECT time_start, time_end, price
                FROM public.available_time
                WHERE variant_id = ${variant_id};
            `).then((r: { rows: Time[]; }) => r.rows)
    }
}

module.exports = new AvailableTime()