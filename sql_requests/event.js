const db = require('../database')

class Event {
    async addNewEvent(start, end, name, categories) {
        try {
            const event_id = await db.query(`
                INSERT INTO public.event(
                event_start, event_end, name)
                VALUES (${start}, '${end}', '${name}')
                RETURNING event_id
            `)
            for (const cat of categories) {
                await db.query(`
                    INSERT INTO public.event_categories(
                    event_id, variant_id)
                    VALUES (${event_id}, ${cat});
                `)
            }
            return true
        } catch (e) {
            console.log(e)
            return false;
        }
    }
    async deleteEvent(event_id){
        try {
            await db.query(`
                DELETE FROM public.event
                WHERE event_id = ${event_id};
            `)
            return true
        } catch (e) {
            console.log(e)
            return false;
        }
    }
    async selectEvent(variant_id, dateString){
        try {
            const res = await db.query(`
                SELECT event_id, event_start, event_end, name
                FROM public.event
                WHERE TO_CHAR(event_start, 'yyyy-mm-dd') <= '${dateString}'
                AND TO_CHAR(event_end, 'yyyy-mm-dd') >= '${dateString}'
            `).then(r => r.rows)
            return [true, res]
        } catch (e) {
            console.log(e)
            return [false, null];
        }
    }

}

module.exports = new Event()