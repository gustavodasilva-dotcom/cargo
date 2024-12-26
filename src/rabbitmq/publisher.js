const { connectRabbitMQ } = require('../config/rabbitmqConfig');

const publishToQueue = async function (queueName, message) {
  const { channel } = await connectRabbitMQ();
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  console.log(`[server] Message sent to queue ${queueName}.`);
};

module.exports = { publishToQueue };
