const amqplib = require('amqplib');
const axios = require("axios");

async function waitAndConnect() {
    let isConnected = false;
    while (!isConnected) {
        try {
            const connection = await amqplib.connect('amqp://guest:guest@rabbitmq:5672/');
            console.log('Connected to RabbitMQ');
            isConnected = true;
            await connection.close(); // закрыть соединение, так как мы его более не используем
        } catch (error) {
            console.error('Connection to RabbitMQ failed. Retrying...', error);
            await new Promise(resolve => setTimeout(resolve, 2000)); // ждать 2 секунды перед повторной попыткой
        }
    }
}

async function consume(consumerName) {
    try {
        await waitAndConnect();

        const connection = await amqplib.connect('amqp://guest:guest@rabbitmq:5672/');
        console.log(`${consumerName} connected to RabbitMQ`);

        const channel = await connection.createChannel();
        const queueName = 'linksQueue';

        await channel.assertQueue(queueName);
        console.log(`${consumerName} waiting for messages from queue: ${queueName}`);

        await channel.consume(queueName, async (msg) => {
            if (msg.content) {
                const message = JSON.parse(msg.content.toString());
                // Обработка сообщения
                if (message?.['link']) {
                    await axios.post('http://nginx:80/linksConsumer', {
                        link: message.link
                    }).then(() => console.log('Consumer: успех'))
                        .catch((e) => console.log('Consumer: провал', e))
                } else {
                    await axios.put(`http://nginx:80/linksConsumer/${message.id}`, {
                        status: message.status
                    }).then(() => console.log('Consumer: успех'))
                        .catch((e) => console.log('Consumer: провал', e))
                }
                console.log(`${consumerName} received message: ${message.link}`);
            }
        }, {noAck: true});
    } catch (error) {
        console.error(`${consumerName} error:`, error);
    }
}

const consumerName = process.argv[2] || 'Consumer';
consume(consumerName).then();

