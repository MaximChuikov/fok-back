import {pool} from '../database'
import '../types/types'

class Event {
    async addNewEvent(time: Time, name: string, categories: { variant_id: number }[]): Promise<void> {
        const event_id = await pool.query(`
                INSERT INTO public.event(
                event_start, event_end, name)
                VALUES (${time.start}, '${time.end}', '${name}')
                RETURNING event_id
            `)
        for (const cat of categories) {
            await pool.query(`
                    INSERT INTO public.event_categories(
                    event_id, variant_id)
                    VALUES (${event_id}, ${cat});
                `)
        }
    }

    async deleteEvent(event_id: number): Promise<void> {
        await pool.query(`
            DELETE FROM public.event
            WHERE event_id = ${event_id};
        `)
    }

    async selectEvent(variant_id: number, date: string): Promise<{event_id: number, event_start: Date, event_end: Date, name: string}[]> {
        return await pool.query(`
            SELECT event_id, event_start, event_end, name
            FROM public.event
            WHERE TO_CHAR(event_start, 'yyyy-mm-dd') <= '${date}'
            AND TO_CHAR(event_end, 'yyyy-mm-dd') >= '${date}'
        `).then((r: { rows: any }) => r.rows)
    }

}
module.exports = new Event()