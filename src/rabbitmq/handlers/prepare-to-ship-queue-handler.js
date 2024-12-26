const handle = function (payload) {
  console.log('Handle prepare-to-ship-queue.', payload);
};

module.exports = { handle };
