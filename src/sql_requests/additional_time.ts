import {pool} from '../database'

class AdditionalTime {
    async createAddTime(hall_id: number, date: string, start: string, end: string): Promise<void> {
        await pool.query(`
                INSERT INTO public.additional_time(
                hall_id, time_date, time_start, time_end)
                VALUES (${hall_id}, '${date}', '${start}', '${end}');
            `).then()
    }

    async selectAddTime(hall_id: number, dateString: string): Promise<Time[]> {
        return await pool.query(`
                SELECT time_start, time_end
                FROM public.additional_time
                WHERE hall_id = ${hall_id}
                AND time_date = '${dateString}';
            `).then((r: { rows: Time[] }) => r.rows)
    }
}
module.exports = new AdditionalTime()