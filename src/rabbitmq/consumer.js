const { connectRabbitMQ } = require('../config/rabbitmqConfig');
const { queues } = require('../rabbitmq/queues');

const startConsumers = async function () {
  const { channel } = await connectRabbitMQ();

  Object.values(queues).forEach((queue) => {
    channel.assertQueue(queue, { durable: true });

    channel.consume(queue, (message) => {
      console.log(`[server] Message received at the queue ${queue}.`);

      try {
        const bufferContent = Buffer.from(message.content);
        if (bufferContent.length === 0) {
          throw new Error('The message content is empty.');
        }

        const payload = bufferContent.toString();

        const handler = require(`./handlers/${queue}-handler`);
        if (
          handler &&
          typeof handler === 'object' &&
          typeof handler.handle === 'function'
        ) {
          handler.handle(payload);
        } else {
          throw new Error(`The queue ${queue} does not have a handler.`);
        }

        console.log(`[server] Message processed at the queue ${queue}.`);

        channel.ack(message);
      } catch (error) {
        console.error(
          `[server] Failure while processing message at the queue ${queue}.`,
          error
        );

        channel.reject(message, false);
      }
    });
  });

  console.log('[server] Consumers started.');
};

module.exports = { startConsumers };
