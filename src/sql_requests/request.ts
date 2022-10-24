import {pool} from '../database';
import Group from '../vk_methods/group'

class MyRequest {
    async selectRequests(variant_id: number, status_id: number): Promise<[{ request_id: number; phone: string; vk_user_id: number; requested_time: [DateTime] }]> {
        const requests: [{
            request_id: number, phone: string,
            vk_user_id: number, requested_time: [DateTime]
        }] = await pool.query(`
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
                SELECT req_date, req_start, req_end, req_price
                FROM public.requested_time
                WHERE request_id = ${request.request_id}
                AND (
                    req_date > CURRENT_DATE
                    OR (
                        req_date = CURRENT_DATE 
                        AND req_start >= CURRENT_TIME
                    )
                )
            `).then((r: { rows: any }) => r.rows)
        return requests
    }

    async selectRequest(request_id: number): Promise<{
        request_id: number, phone: string,
        vk_user_id: number, status: string, variant: string, requested_time: [DateTime]
    }> {
        const request: {
            request_id: number, phone: string,
            vk_user_id: number, status: string, variant: string, requested_time: [DateTime]
        } = await pool.query(`
            SELECT re.request_id, re.phone, re.vk_user_id,
            st.name AS status, va.name AS variant
            FROM public.request as re, public.request_status as st, 
            public.variant as va
            WHERE re.request_id = ${request_id}
            AND re.status_id = st.status_id
            AND re.variant_id = va.variant_id
        `).then((r: { rows: [[number, string, number]] }) => r.rows[0])

        request.requested_time = await pool.query(`
            SELECT req_date, req_start, req_end, req_price
            FROM public.requested_time
            WHERE request_id = ${request_id}
        `).then((r: { rows: any }) => r.rows)
        return request
    }

    async selectAcceptedRequestsByDate(hall_id: number, dateString: string): Promise<Time[]> {
        return await pool.query(`
            SELECT t.req_start, t.req_end
            FROM public.requested_time as t, public.request as r, public.variant as var
            WHERE r.request_id = t.request_id
            AND var.hall_id = ${hall_id}
            AND var.variant_id = r.variant_id
            AND r.status_id = 2
            AND t.req_date = '${dateString}'
        `).then((r: { rows: Time }) => r.rows)
    }

    async selectAcceptedRequestsByDateWithCount(variant_id: number, dateString: string, available_time:
        { time_start: string, time_end: string}[]): Promise<{ time_start: string, time_end: string, price: number, filled: number }[]> {
        const av_time_fill: { time_start: string, time_end: string, price: number, filled: number }[] = []
        for (const time of available_time) {
            const fill = await this.selectCount(variant_id, dateString, time.time_start, time.time_end)
            // @ts-ignore
            const t = JSON.parse(JSON.stringify(time))
            t.filled = fill
            av_time_fill.push(t)
        }
        return av_time_fill
    }

    async selectCount(variant_id: number, dateString: string, start: string, end: string): Promise<number> {
        return await pool.query(` 
            SELECT COUNT(*)
            FROM public.requested_time as rt, public.request as r
            WHERE r.request_id = rt.request_id
            AND r.variant_id = ${variant_id}
            AND r.status_id = 2
            AND rt.req_date = '${dateString}'
            AND rt.req_start = '${start}'
            AND rt.req_end = '${end}'
        `).then((r: { rows: any }) => r.rows[0].count)
    }

    async selectAllAcceptedRequests(hall_id: number): Promise<Time[]> {
        return await pool.query(`
            SELECT * FROM
            public.requested_time as t, public.variant as var, public.request as r
            WHERE r.request_id = t.request_id
            AND r.variant_id = var.variant_id
            AND var.hall_id = ${hall_id}
            AND r.status_id = 2
            AND (
                    t.req_date > CURRENT_DATE
                    OR (
                        t.req_date = CURRENT_DATE 
                        AND t.req_start >= CURRENT_TIME
                    )
            )
        `).then((r: { rows: Time }) => r.rows)
    }

    async selectTheAllAcceptedRequests(): Promise<[{ request_id: number; phone: string; vk_user_id: number; requested_time: [DateTime] }]> {
        let requests: [{
            request_id: number, phone: string,
            vk_user_id: number, requested_time: [DateTime]
        }] = await pool.query(`
            SELECT re.request_id, re.phone, re.vk_user_id,
            st.name AS status, va.name AS variant
            FROM public.request as re, public.request_status as st, 
            public.variant as va
            WHERE re.status_id = st.status_id
            AND st.status_id = 2
            AND re.variant_id = va.variant_id
        `).then((r: { rows: [[number, string, number]] }) => r.rows)
        for (const request of requests)
            request.requested_time = await pool.query(`
                SELECT req_date, req_start, req_end, req_price
                FROM public.requested_time
                WHERE request_id = ${request.request_id}
                AND (
                    req_date > CURRENT_DATE
                    OR (
                        req_date = CURRENT_DATE 
                        AND req_end >= CURRENT_TIME
                    )
                )
            `).then((r: { rows: any }) => r.rows)
        // @ts-ignore
        requests = requests.filter(r => r.requested_time.length > 0)
        return requests
    }

    async selectUserRequests(vk_id: number): Promise<[{
        request_id: number, phone: string,
        vk_user_id: number, variant_id: number, requested_time: [DateTime]
    }]> {
        let requests: [{
            request_id: number, phone: string,
            vk_user_id: number, variant_id: number, requested_time: [DateTime]
        }] = await pool.query(`
            SELECT re.request_id, re.phone, re.vk_user_id,
            st.name AS status, va.name AS variant, va.variant_id, va.variant_id
            FROM public.request as re, public.request_status as st,
            public.variant as va
            WHERE re.status_id = st.status_id
            AND re.variant_id = va.variant_id
            AND re.vk_user_id = ${vk_id}
        `).then((r: { rows: [[number, string, number]] }) => r.rows)
        for (const request of requests)
            request.requested_time = await pool.query(`
                SELECT req_date, req_start, req_end, req_price
                FROM public.requested_time
                WHERE request_id = ${request.request_id}
                AND (
                    req_date > CURRENT_DATE
                    OR (
                        req_date = CURRENT_DATE 
                        AND req_end >= CURRENT_TIME
                    )
                )
            `).then((r: { rows: any }) => r.rows)
        // @ts-ignore
        return requests.filter(r => r.requested_time.length > 0)
    }

    //requests = [ {date, start, end}, ... ]
    async createRequest(variant_id: number, phone: string, vk_user_id: number, requests: [DateTime]): Promise<number> {
        const client = await pool.connect()
        let request_id: number
        try {
            await client.query('BEGIN')
            request_id = await pool.query(`
                INSERT INTO public.request(
                variant_id, phone, vk_user_id, status_id)
                VALUES (${variant_id}, ${phone}, ${vk_user_id}, 1)
                RETURNING request_id;
            `).then((r => r.rows[0].request_id))

            for (const req of requests) {
                // @ts-ignore
                await pool.query(`
                    INSERT INTO public.requested_time(
                    request_id, req_date, req_start, req_end, req_price)
                    VALUES (${request_id}, '${req.date}', '${req.start}', '${req.end}', ${req.price});
                `).then()
            }
            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            request_id = 0
        } finally {
            client.release()
        }
        return request_id
    }

    async deleteRequest(request_id: number): Promise<{ vk_id: number }> {
        return await pool.query(`
            DELETE FROM public.request
            WHERE request_id = ${request_id}
            RETURNING vk_user_id;
        `).then((r: any) => r.rows[0].vk_user_id)
    }

    async acceptRequest(request_id: number): Promise<{ vk_user_id: number }> {
        return await pool.query(`
            UPDATE public.request
            SET status_id = 2
            WHERE request_id = ${request_id}
            RETURNING vk_user_id
        `).then((r: any) => r.rows[0].vk_user_id)
    }
}

module.exports = new MyRequest()