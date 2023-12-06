const {PrismaClient} = require('../prisma/client')
const prisma = new PrismaClient()
const amqplib = require('amqplib');

const rabbitMQURL = 'amqp://guest:guest@rabbitmq:5672/';
const queueName = 'linksQueue';

async function sendToQueuePost(message: {link: string}) {
    try {
        const connection = await amqplib.connect(rabbitMQURL);
        console.log('Connected to RabbitMQ');

        const channel = await connection.createChannel();
        await channel.assertQueue(queueName);
        console.log(`Queue '${queueName}' asserted`);

        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
        console.log('Message POST sent to the queue');
    }catch (e) {
        console.log('RABBIT SEND FAIL :(')
    }
}

async function sendToQueuePut(message: {status: string, id: string}) {
    try {
        const connection = await amqplib.connect(rabbitMQURL);
        console.log('Connected to RabbitMQ');

        const channel = await connection.createChannel();
        await channel.assertQueue(queueName);
        console.log(`Queue '${queueName}' asserted`);

        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
        console.log('Message PUT sent to the queue');
    }catch (e) {
        console.log('RABBIT SEND FAIL :(')
    }
}



export async function createLink(link: string) {
    const data = await prisma.links.create({
        data: {link, status: ''}
    })
    console.log("Ссылка создана", data)
    return data
}

export async function queueCreateLink(link: string) {
    await sendToQueuePost({ link });
    return `Ссылка ${link} добавлена в очередь на создание`
}

export async function getLinks() {
    return await prisma.links.findMany({
        where: {
            id: {gte: 1}
        }
    }).then(r => r).catch(e => e)
}

export async function putLink(id: string, status: string) {
    return prisma.links.update({
        where: {id: parseInt(id)},
        data: {
            status: status
        }
    });
}

export async function dropLinks() {
    return prisma.links.deleteMany({
        where: {
            id: {gte: 1}
        }
    })
}

export async function queuePutLink(id: string, status: string) {
    await sendToQueuePut({status, id})
}