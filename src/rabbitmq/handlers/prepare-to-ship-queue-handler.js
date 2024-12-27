const { PrismaClient } = require('@prisma/client');
const { TRACKING_STATUS } = require('../../enums/trackingStatus');
const { publishToQueue } = require('../publisher');
const { queues } = require('../queues');

const prisma = new PrismaClient();

const handle = async function (payload) {
  const obj = JSON.parse(payload);
  if (!obj) throw new Error('Invalid payload. Payload is empty.');

  const shippingOrderId = obj['shipping_order_id'];
  if (Object.keys(obj).length === 0 || typeof shippingOrderId === 'undefined') {
    throw new Error('Invalid payload. Missing key shipping_order_id.');
  }

  const shippingOrder = await prisma.shippingOrder.findFirst({
    where: { Id: shippingOrderId }
  });
  if (!shippingOrder) {
    throw new Error(
      'Invalid payload. No record was found with the informed shipping_order_id.'
    );
  }

  setTimeout(async () => {
    await prisma.shippingOrder.update({
      where: { Id: shippingOrderId },
      data: { ShippedAt: new Date() }
    });

    await publishToQueue(queues.UPDATE_TRACKING, {
      shipping_order_id: shippingOrder.Id,
      tracking_status: TRACKING_STATUS.PACKAGE_SHIPPED
    });
  }, 2 * 60000);
};

module.exports = { handle };
