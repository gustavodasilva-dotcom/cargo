const { Prisma, PrismaClient } = require('@prisma/client');
const { distinct } = require('../utils/arrayUtils');

const prisma = new PrismaClient();

const handleGetAllShippingOrders = async function (_req, res) {
  const shippingOrders = await prisma.shippingOrder.findMany();
  if (shippingOrders.length === 0) return res.sendStatus(204);
  const result = shippingOrders.map((order) => {
    return {
      id: order.Id,
      status: order.Status
    };
  });
  res.json([...result]);
};

const handleGetShippingOrderById = async function (req, res) {
  const { id } = req.params;
  const shippingOrder = await prisma.shippingOrder.findFirst({
    where: { Id: id },
    include: { ShippingOrderItem: true }
  });
  if (!shippingOrder) {
    return res.status(404).json({
      title: 'Not Found',
      detail: `Not shipping order found regarding the id ${id}.`,
      instance: req.originalUrl,
      status: 404
    });
  }
  res.json({
    id: shippingOrder.Id,
    status: shippingOrder.Status,
    delivered_at: shippingOrder.DeliveredAt,
    shipped_at: shippingOrder.ShippedAt,
    items: shippingOrder.ShippingOrderItem.map((item) => {
      return {
        id: item.Id,
        title: item.Title,
        barcode: item.Barcode,
        quantity: item.Quantity,
        measurement_id: item.MeasurementId
      };
    })
  });
};

const handleCreateShippingOrder = async function (req, res) {
  const { items } = req.body;
  const measurementIds = [...items]
    .map((item) => item['measurement_id'])
    .filter(distinct);
  const result = await prisma.$queryRaw`
    SELECT COUNT(*) AS Count
    FROM Measurement
    WHERE Id IN(${Prisma.join(measurementIds)})
  `;
  if (!result || !Array.isArray(result)) {
    throw new Error('Error while executing query at the database.');
  }
  const count = result[0]?.Count;
  if (!count || isNaN(count)) {
    throw new Error('The result from the query could not be processed.');
  }
  if (count !== measurementIds.length) {
    return res.status(400).json({
      title: 'Bad Request',
      detail: 'Not every measurement assigned to the items exists.',
      instance: req.originalUrl,
      status: 400
    });
  }
  const shippingOrder = await prisma.shippingOrder.create({
    data: {
      ShippingOrderItem: {
        create: [...items].map((item) => {
          return {
            Title: item.title,
            Barcode: item.barcode,
            Quantity: item.quantity,
            MeasurementId: item['measurement_id']
          };
        })
      }
    }
  });
  res.status(201).json({
    shipping_order_id: shippingOrder.Id
  });
};

const handleDeleteShippingOrder = async function (req, res) {
  const { id } = req.params;
  const shippingOrder = await prisma.shippingOrder.findFirst({
    where: { Id: id }
  });
  if (!shippingOrder) {
    return res.status(404).json({
      title: 'Not Found',
      detail: `Not shipping order found regarding the id ${id}.`,
      instance: req.originalUrl,
      status: 404
    });
  }
  await prisma.shippingOrder.delete({
    where: { Id: id }
  });
  res.sendStatus(204);
};

module.exports = {
  handleGetAllShippingOrders,
  handleGetShippingOrderById,
  handleCreateShippingOrder,
  handleDeleteShippingOrder
};