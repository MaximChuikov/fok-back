const db = require('../database')

class AvailableTime {
    async selectAvailableTime(variant_id) {
        try {
            const res = await db.query(`
                SELECT time_start, time_end
                FROM public.available_time
                WHERE variant_id = ${variant_id};
            `).then(r => r.rows)
            return [true, res]
        } catch (e) {
            console.log(e)
            return [false, null];
        }
    }
}

module.exports = new AvailableTime()