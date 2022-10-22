import {pool} from '../database';

class Variant {
    async selectVariant(variant_id: number): Promise<{name: string, hall:number, whole: boolean, capacity: number}> {
        return await pool.query(`
            SELECT name, hall_id, whole, capacity
            FROM public.variant
            WHERE variant_id = ${variant_id};
        `).then((r: { rows: any; }) => r.rows[0])
    }

    async selectHall(variant_id: number): Promise<{hall_id: number}> {
        return await pool.query(`
            SELECT hall_id
            FROM public.variant
            WHERE variant_id = ${variant_id};
        `).then((r: { rows: any; }) => r.rows[0].hall_id)
    }
}

module.exports = new Variant()