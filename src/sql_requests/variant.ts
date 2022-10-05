import {pool} from '../database';

class Variant {
    async selectVariants(): Promise<[variant_id: number, name: string]> {
        return await pool.query(`
            SELECT variant_id, name
            FROM public.variant;
        `).then((r: { rows: any; }) => r.rows)
    }
}

module.exports = new Variant()