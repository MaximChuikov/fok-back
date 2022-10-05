import {pool} from '../database'

class AdditionalTime {
    async createAddTime(variant_id: number, date: string, start: string, end: string): Promise<void> {
        await pool.query(`
                INSERT INTO public.additional_time(
                variant_id, time_date, time_start, time_end)
                VALUES (${variant_id}, ${date}, ${start}, ${end});
            `).then()
    }

    async selectAddTime(variant_id: number, dateString: string): Promise<Time[]> {
        const res: Time[] = await pool.query(`
                SELECT time_start, time_end
	            FROM public.additional_time
	            WHERE variant_id = ${variant_id}
	            AND time_date = '${dateString}';
            `).then((r: { rows: Time[] }) => r.rows)
        return res

    }
}
module.exports = new AdditionalTime()