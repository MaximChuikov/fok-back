import {Hall, PrismaClient, Request, Requested_time, Status, Variant} from '@prisma/client'
const prisma = new PrismaClient()

function filterSortRequestArr(
    arr: { requested_time: Requested_time[], request_id: number, phone: string, vk_id: number, variant: Variant }[]):
    { requested_time: Requested_time[], request_id: number, phone: string, vk_id: number, variant: Variant }[] {

    arr = arr.filter(e => e.requested_time.length > 0)
    return arr.sort((a, b) => {
        const a_min = a.requested_time[0].full_start
        const b_min = b.requested_time[0].full_start
        if (a_min < b_min)
            return -1
        else if (a_min > b_min)
            return 1
        else
            return 0
    })
}

class MyRequest {
    async selectRequests(variant_id: number, status: Status):
        Promise<{
            request_id: number, phone: string, vk_id: number,
            requested_time: {
                full_start: Date, full_end: Date, price: number
            }[]
        }[]> {

        return await prisma.request.findMany({
            where: {
                AND: [
                    {variant_id: variant_id},
                    {status: status}
                ]
            },
            select: {
                request_id: true,
                phone: true,
                vk_id: true,
                requested_time: {
                    select: {
                        full_start: true,
                        full_end: true,
                        price: true
                    },
                    where: {
                        full_start: {gte: new Date()}
                    }
                }
            }

        })
    }

    async selectRequest(request_id: number):
        Promise<Request & { requested_time: Requested_time[] }> {
        return await prisma.request.findUnique({
            where: {
                request_id: request_id
            },
            include: {
                requested_time: true
            }
        })
    }

    /*
        @param date Find 0:00 and 23:59, and finding requests
     */
    async selectAcceptedRequestsByDate(hall: Hall, date: Date): Promise<{ full_start: Date, full_end: Date }[]> {

        const morning = new Date(date.getTime())
        morning.setHours(0, 0, 0)
        const evening = new Date(date.getDate())
        evening.setHours(23, 59, 59)

        return await prisma.requested_time.findMany({
            select: {
                full_start: true,
                full_end: true
            },
            where: {
                AND: [
                    {full_start: {gte: morning}},
                    {full_end: {lte: evening}},
                    {
                        request: {
                            status: Status.accepted,
                            variant: {
                                hall: hall
                            }
                        }
                    }
                ]

            }
        })
    }

    async selectAcceptedRequestsByDateWithCount(variant: Variant, settlementSessions: {start: Date, end: Date}[]):
        Promise<{session: {start: Date, end: Date}, count: number}[]> {

        let result: { session: {start: Date, end: Date}, count: number }[] = []
        for (const x of settlementSessions) {
            result.push({
                session: x,
                count: await this.selectAcceptedCount(variant, x.start, x.end)
            })
        }
        return result
    }

    async selectAcceptedCount(variant: Variant, start: Date, end: Date): Promise<number> {
        return prisma.requested_time.count({
            where: {
                AND: [
                    {
                        request: {
                            AND: [
                                {status: Status.accepted},
                                {variant: variant}
                            ]
                        }
                    },
                    {full_start: start},
                    {full_end: end}
                ]
            }
        })
    }

    async selectAllAcceptedRequestsOrderedFiltered():
        Promise<{ requested_time: Requested_time[], request_id: number, phone: string, vk_id: number, variant: Variant }[]> {

        let arr = await prisma.request.findMany({
            where: {
                status: Status.accepted
            },
            select: {
                request_id: true,
                phone: true,
                vk_id: true,
                variant: true,
                requested_time: {
                    where: {
                        full_start: {gte: new Date()}
                    },
                    orderBy: {
                        full_start: 'asc'
                    }
                }
            },

        })
        return filterSortRequestArr(arr)
    }

    async selectUserRequests(vk_id: number):
        Promise<{ requested_time: Requested_time[], request_id: number, phone: string, vk_id: number, variant: Variant }[]> {
        let arr = await prisma.request.findMany({
            where: {
                vk_id: vk_id
            },
            select: {
                request_id: true,
                phone: true,
                vk_id: true,
                variant: true,
                requested_time: {
                    where: {
                        full_start: {gte: new Date()}
                    },
                    orderBy: {
                        full_start: 'asc'
                    }
                }
            },
        })
        return filterSortRequestArr(arr)
    }

    async createRequest(variant: Variant, phone: string, vk_user_id: number,
                        requests: { full_start: Date, full_end: Date, price: number }[]): Promise<void> {

        await prisma.request.create({
            data: {
                phone: phone,
                variant_id: variant.variant_id,
                vk_id: vk_user_id,
                status: Status.consideration,
                requested_time: {
                    create: requests
                }
            }
        })
    }

    async deleteRequest(request_id: number): Promise<{ vk_id: number, reason: string }> {

        const info = await prisma.request.findFirstOrThrow({
            select: {status: true, variant: true, requested_time: true, vk_id: true},
            where: {request_id: request_id}
        })

        switch (info.status) {
            case Status.accepted:
                await prisma.request.update({
                    where: {
                        request_id: request_id
                    },
                    data: {
                        status: Status.canceled
                    }
                })
                return {
                    vk_id: info.vk_id,
                    reason: `Ваша бронь №${request_id} отменена`
                }
            case Status.consideration:
                await prisma.request.update({
                    where: {
                        request_id: request_id
                    },
                    data: {
                        status: Status.denied
                    }
                })
                return {
                    vk_id: info.vk_id,
                    reason: `Ваша заявка №${request_id} отклонена`
                }
        }
    }

    /*
        Checking request before accepting.
        All requests with consideration status will be ousted.
     */
    async acceptRequest(request_id: number):
        Promise<{ result: boolean, message: string, vk_id: number[], userMessage: string }> {

        const info = await prisma.request.findFirstOrThrow({
            select: {status: true, variant: true, requested_time: true, vk_id: true},
            where: {request_id: request_id}
        })

        // Checking request
        for (const time of info.requested_time) {
            if (info.variant.entire_hall) {
                const count = await this.selectAcceptedCount(info.variant, time.full_start, time.full_end)
                if (count === 1) {
                    return {
                        result: false,
                        message: `Зал на время ${time.full_start} уже забронирован, заявка не принята.`,
                        vk_id: null,
                        userMessage: null
                    }
                }
            } else {
                const fill = await this.selectAcceptedCount(info.variant, time.full_start, time.full_end)
                if (fill >= info.variant.capacity) {
                    return {
                        result: false,
                        message: `Зал на время ${time.full_start} переполнен, заявка не принята.`,
                        vk_id: null,
                        userMessage: null
                    }
                }
            }
        }

        // Do accept
        await prisma.request.update({
            where: {request_id: request_id},
            data: {status: Status.accepted}
        })

        // Do status oust to other
        const users: number[] = []
        let message: string = ""
        for (const time of info.requested_time) {

            const findConsiderationRequests = await prisma.request.findMany({
                select: {
                    request_id: true,
                    vk_id: true
                },
                where: {
                    AND: [
                        {
                            requested_time: {
                                some: {
                                    AND: [
                                        {full_start: time.full_start},
                                        {full_end: time.full_end}
                                    ]
                                }
                            }
                        },
                        {
                            variant: {
                                hall: info.variant.hall
                            }
                        },
                        {status: Status.consideration}
                    ]
                }
            })
            if (info.variant.entire_hall) {
                await prisma.$transaction(
                    findConsiderationRequests.map(e => prisma.request.update({
                        where: {request_id: e.request_id},
                        data: {status: Status.ousted}
                    }))
                )
                findConsiderationRequests.forEach(e => {
                    users.push(e.vk_id)
                })
                message = `Зал на время, которое вы выбрали в своей заявке, теперь занято. 
                        Пожалуйста отправьте новую заявку.`
            } else {
                const fill = await this.selectAcceptedCount(info.variant, time.full_start, time.full_end)
                if (fill >= info.variant.capacity) {
                    findConsiderationRequests.forEach(e => {
                        users.push(e.vk_id)
                    })
                    message = `Зал на время, которое вы выбрали в своей заявке, уже переполнен.
                             Пожалуйста отправьте новую заявку.`
                }
            }
        }
        return {
            result: true,
            message: 'Заявка успешно принята',
            vk_id: users,
            userMessage: message
        }
    }
}

module.exports = new MyRequest()