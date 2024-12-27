const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const handleGetShippingOrderTracking = async function (req, res) {
  const trackingCode = req['tracking_code'];

  const shippingOrder = await prisma.shippingOrder.findFirst({
    where: { TrackingCode: trackingCode },
    include: { TrackingHistory: true }
  });

  if (!shippingOrder) {
    return res.status(404).json({
      title: 'Not Found',
      detail: `Not shipping order found regarding the tracking code ${trackingCode}.`,
      instance: req.originalUrl,
      status: 404
    });
  }

  res.status(200).json({
    tracking_code: shippingOrder.TrackingCode,
    shipped_at: shippingOrder.ShippedAt,
    delivered_at: shippingOrder.DeliveredAt,
    events: shippingOrder.TrackingHistory.map((history) => {
      return {
        occurred_at: history.CreatedAt,
        description: history.Description
      };
    })
  });
};

module.exports = { handleGetShippingOrderTracking };
