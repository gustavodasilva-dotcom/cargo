const { connectRabbitMQ } = require('../config/rabbitmqConfig');

const startConsumers = async function () {
  await connectRabbitMQ();

  console.log('[server] Consumers started.');
};

module.exports = { startConsumers };
