const db = require('../database')

class Request {
    async selectRequests(variant_id, status_id) {
        try {
            const requests = await db.query(`
                SELECT re.request_id, re.phone, re.vk_user_id,
                st.name AS status, va.name AS variant
                FROM public.request as re, public.request_status as st, 
                public.variant as va
                WHERE re.status_id = ${status_id}
                AND st.status_id = ${status_id}
                AND re.variant_id = va.variant_id
                AND re.variant_id = ${variant_id}
            `).then(r => r.rows)
            for (const request of requests)
                request.requested_time = await db.query(`
                    SELECT req_date, req_start, req_end
                    FROM public.requested_time
                    WHERE request_id = ${request.request_id}
                `).then(r => r.rows)
            return [true, requests]
        } catch (e) {
            console.log(e)
            return [false, null];
        }
    }

    async selectAcceptedRequests(variant_id, dateString) {
        try {
            const requests = await db.query(`
                SELECT t.req_start, t.req_end
                FROM public.requested_time as t, public.request as r
                WHERE r.request_id = t.request_id
                AND r.status_id = 2
                AND t.req_date = '${dateString}'
            `).then(r => r.rows)
            return [true, requests]
        } catch (e) {
            console.log(e)
            return [false, null];
        }
    }

    //requests = [ {date, start, end}, ... ]
    async createRequest(variant_id, phone, vk_user_id, requests) {
        try {
            const request_id = await db.query(`
                INSERT INTO public.request(
                variant_id, phone, vk_user_id, status_id)
                VALUES (${variant_id}, ${phone}, ${vk_user_id}, 1)
                RETURNING request_id;
            `).then(r => r.rows)
            for (const req of requests)
                await db.query(`
                    INSERT INTO public.requested_time(
                        request_id, req_date, req_start, req_end)
                        VALUES (${request_id}, '${req.date}', '${req.start}', '${req.end}');
                `).then(r => r.rows)
            return [true, request_id]
        } catch (e) {
            console.log(e)
            return [false, null];
        }
    }

    async deleteRequest(request_id){
        try {
            const vk_id = await db.query(`
                DELETE FROM public.request
                WHERE request_id = ${request_id}
                RETURNING vk_user_id;
            `).then(r => r)
            return [true, vk_id]
        } catch (e) {
            console.log(e)
            return [false, null]
        }
    }

    async acceptRequest(request_id){
        try {
            await db.query(`
                UPDATE public.request
                SET status_id = 2
                WHERE request_id = ${request_id};
            `).then(r => r.rows)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

}

module.exports = new Request()