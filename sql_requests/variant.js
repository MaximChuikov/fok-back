const db = require('../database')

class Variant {
    async selectVariants() {
        try {
            const res = await db.query(`
                SELECT variant_id, name
                FROM public.variant;
            `).then(r => r.rows)
            return [true, res]
        } catch (e) {
            console.log(e)
            return [false, null];
        }
    }

}

module.exports = new Variant()