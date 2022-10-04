const db = require('../database')

class AdditionalTime {
    async createAddTime(variant_id, date, start, end) {
        try {
            await db.query(`
                INSERT INTO public.additional_time(
                variant_id, time_date, time_start, time_end)
                VALUES (${variant_id}, ${date}, ${start}, ${end});
            `)
            return true
        } catch (e) {
            console.log(e)
            return false;
        }
    }
    async selectAddTime(variant_id, dateString){
        try {
            const res = await db.query(`
                SELECT time_start, time_end
	            FROM public.additional_time
	            WHERE variant_id = ${variant_id}
	            AND time_date = '${dateString}';
            `).then(r => r.rows)
            return [true, res]
        } catch (e) {
            console.log(e)
            return [false, null];
        }
    }
}

module.exports = new AdditionalTime()