const amqp = require('amqplib');

let connection, channel;

const connectRabbitMQ = async function () {
  if (connection) return { connection, channel };
  connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  console.log('[server] Connected to RabbitMQ.');
  return { connection, channel };
};

module.exports = { connectRabbitMQ };
