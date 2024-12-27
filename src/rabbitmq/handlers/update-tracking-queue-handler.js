const {
  TRACKING_STATUS,
  TrackingStatusDescriptions
} = require('../../enums/trackingStatus');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const handle = async function (payload) {
  const obj = JSON.parse(payload);
  if (!obj) throw new Error('Invalid payload. Payload is empty.');

  const shippingOrderId = obj['shipping_order_id'];
  const trackingStatus = obj['tracking_status'];
  if (
    Object.keys(obj).length === 0 ||
    typeof shippingOrderId === 'undefined' ||
    typeof trackingStatus === 'undefined'
  ) {
    throw new Error('Invalid payload. Missing keys.');
  }

  if (Object.values(TRACKING_STATUS).indexOf(trackingStatus) === -1) {
    throw new Error('Invalid payload. Invalid tracking status.');
  }

  const trackingDescription = TrackingStatusDescriptions[trackingStatus];
  if (typeof trackingDescription === 'undefined') {
    throw new Error(
      `There was not found a description for the tracking_status ${trackingStatus}.`
    );
  }

  const shippingOrder = await prisma.shippingOrder.findFirst({
    where: { Id: shippingOrderId }
  });
  if (!shippingOrder) {
    throw new Error(
      'Invalid payload. No record was found with the informed shipping_order_id.'
    );
  }

  await prisma.shippingOrderTrackingHistory.create({
    data: {
      Type: trackingStatus,
      Description: trackingDescription,
      ShippingOrderId: shippingOrderId
    }
  });
};

module.exports = { handle };
