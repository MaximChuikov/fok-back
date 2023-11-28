const {PrismaClient} = require('../prisma/client')
const prisma = new PrismaClient()
const amqplib = require('amqplib');

const rabbitMQURL = 'amqp://guest:guest@rabbitmq:5672/';
const queueName = 'linksQueue';

async function sendToQueue(message: {link: string}) {
    try {
        const connection = await amqplib.connect(rabbitMQURL);
        console.log('Connected to RabbitMQ');

        const channel = await connection.createChannel();
        await channel.assertQueue(queueName);
        console.log(`Queue '${queueName}' asserted`);

        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
        console.log('Message sent to the queue');
    }catch (e) {
        console.log('RABBIT SEND FAIL :(')
    }
}



export async function createLink(link: string) {
    return await prisma.links.create({
        data: {link, status: ''}
    }).then(async (r) => {
        await sendToQueue({ link });
        return `Ссылка добавлена в очередь c id ${r.id} ${link}`
    })

}

export async function getLinks() {
    return await prisma.links.findMany({
        where: {
            id: {gte: 1}
        }
    }).then(r => r).catch(e => e)
}

export async function putLink(id: string, status: string) {
    const findLink = await prisma.links.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    console.log('Обновляю статус этой ссылки на ' + status, findLink)

    return prisma.links.update({
        where: {id: parseInt(id)},
        data: {
            status: status
        }
    });
}