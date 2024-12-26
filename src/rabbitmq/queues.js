const queues = Object.freeze({
  PREPARE_TO_SHIP: 'prepare-to-ship-queue',
  UPDATE_TRACKING: 'update-tracking-queue'
});

const exchanges = {};

module.exports = { queues, exchanges };
