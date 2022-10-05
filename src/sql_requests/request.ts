import { pool } from '../database';

class MyRequest {
    async selectRequests(variant_id: number, status_id: number): Promise<[{ request_id: number; phone: string; vk_user_id: number; requested_time: [DateTime] }]>  {
        const requests: [{request_id: number, phone: string,
            vk_user_id: number, requested_time: [DateTime]}] = await pool.query(`
            SELECT re.request_id, re.phone, re.vk_user_id,
            st.name AS status, va.name AS variant
            FROM public.request as re, public.request_status as st, 
            public.variant as va
            WHERE re.status_id = ${status_id}
            AND st.status_id = ${status_id}
            AND re.variant_id = va.variant_id
            AND re.variant_id = ${variant_id}
        `).then((r: { rows: [[number, string, number]] }) => r.rows)
        for (const request of requests)
            request.requested_time = await pool.query(`
                SELECT req_date, req_start, req_end
                FROM public.requested_time
                WHERE request_id = ${request.request_id}
            `).then((r: { rows: any }) => r.rows)
        return requests
    }

    async selectAcceptedRequests(variant_id: number, dateString: string): Promise<Time[]> {
        return await pool.query(`
            SELECT t.req_start, t.req_end
            FROM public.requested_time as t, public.request as r
            WHERE r.request_id = t.request_id
            AND r.status_id = 2
            AND t.req_date = '${dateString}'
        `).then((r: { rows: Time }) => r.rows)
    }

    //requests = [ {date, start, end}, ... ]
    async createRequest(variant_id: number, phone: string, vk_user_id: number, requests: [DateTime]) : Promise<number> {
        const request_id: number = await pool.query(`
            INSERT INTO public.request(
            variant_id, phone, vk_user_id, status_id)
            VALUES (${variant_id}, ${phone}, ${vk_user_id}, 1)
            RETURNING request_id;
        `).then((r: number) => r)
        for (const req of requests)
            await pool.query(`
                INSERT INTO public.requested_time(
                    request_id, req_date, req_start, req_end)
                    VALUES (${request_id}, '${req.date}', '${req.start}', '${req.end}');
            `).then()
        return request_id
    }

    async deleteRequest(request_id: number) : Promise<{vk_id: number}>{
        return await pool.query(`
            DELETE FROM public.request
            WHERE request_id = ${request_id}
            RETURNING vk_user_id;
        `).then((r: number) => r)
    }

    async acceptRequest(request_id: number) : Promise<{vk_user_id: number}>{
        return await pool.query(`
            UPDATE public.request
            SET status_id = 2
            WHERE request_id = ${request_id}
            RETURNING vk_user_id
        `).then((r: number) => r)
    }
}

module.exports = new MyRequest()