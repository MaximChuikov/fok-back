import {pool} from '../database'
import '../types/types'

class Event {
    async addNewEvent(time: Timestamp, name: string, hall_id: number): Promise<void> {
        await pool.query(`
                INSERT INTO public.event(
                event_start, event_end, name, hall_id)
                VALUES ('${time.start}', '${time.end}', '${name}', ${hall_id})
                RETURNING event_id
        `)
    }

    async deleteEvent(event_id: number): Promise<void> {
        await pool.query(`
            DELETE FROM public.event
            WHERE event_id = ${event_id};
        `)
    }

    async selectEvent(hall_id: number, date: string): Promise<{ event_id: number, event_start: Date, event_end: Date, name: string }[]> {
        return await pool.query(`
            SELECT event_id, event_start, event_end, name
            FROM public.event
            WHERE TO_CHAR(event_start, 'yyyy-mm-dd') <= '${date}'
            AND TO_CHAR(event_end, 'yyyy-mm-dd') >= '${date}'
            AND hall_id = ${hall_id};
        `).then((r: { rows: any }) => r.rows)
    }
    async selectAllEvents(hall_id: number): Promise<{ event_id: number, event_start: Date, event_end: Date, name: string }[]> {
        return await pool.query(`
            SELECT event_id, event_start, event_end, name
            FROM public.event
            WHERE hall_id = ${hall_id};
        `).then((r: { rows: any }) => r.rows)
    }
}

module.exports = new Event()