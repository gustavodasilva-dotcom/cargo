const { Prisma, PrismaClient } = require('@prisma/client');
const { SHIPPING_PARTIES } = require('../enums/shippingParties');
const { SHIPPING_STATUS } = require('../enums/shippingStatus');
const { distinct } = require('../utils/arrayUtils');
const { generateRandomString } = require('../utils/stringUtils');
const { publishToQueue } = require('../rabbitmq/publisher');
const { queues } = require('../rabbitmq/queues');

const prisma = new PrismaClient();

const handleGetAllShippingOrders = async function (_req, res) {
  const shippingOrders = await prisma.shippingOrder.findMany();
  if (shippingOrders.length === 0) return res.sendStatus(204);

  const result = shippingOrders.map((order) => {
    return {
      id: order.Id,
      status: order.Status,
      tracking_code: order.TrackingCode
    };
  });

  res.json([...result]);
};

const handleGetShippingOrderById = async function (req, res) {
  const { id } = req.params;

  const shippingOrder = await prisma.shippingOrder.findFirst({
    where: { Id: id },
    include: { Parties: true, Items: true }
  });

  if (!shippingOrder) {
    return res.status(404).json({
      title: 'Not Found',
      detail: `Not shipping order found regarding the id ${id}.`,
      instance: req.originalUrl,
      status: 404
    });
  }

  const shippingOrderParties = shippingOrder.Parties.map((party) => {
    return {
      id: party.Id,
      name: party.Name,
      email: party.Email,
      cellphone: party.Cellphone,
      address: party.Address
    };
  });

  res.json({
    id: shippingOrder.Id,
    status: shippingOrder.Status,
    tracking_code: shippingOrder.TrackingCode,
    delivered_at: shippingOrder.DeliveredAt,
    shipped_at: shippingOrder.ShippedAt,
    senders: shippingOrderParties.filter(
      (party) => party.PartyType === SHIPPING_PARTIES.SENDER
    ),
    recipients: shippingOrderParties.filter(
      (party) => party.PartyType === SHIPPING_PARTIES.RECIPIENT
    ),
    items: shippingOrder.Items.map((item) => {
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
  const { senders, recipients, items } = req.body;

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
      Parties: {
        create: [...senders, ...recipients].map((party) => {
          return {
            PartyType: party.type,
            Name: party.name,
            Email: party.email,
            Cellphone: party.cellphone,
            Address: party.address
          };
        })
      },
      Items: {
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

const handlePrepareToShip = async function (req, res) {
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

  const trackingCode = `TC${new Date().getFullYear()}${generateRandomString(11)}`;

  await prisma.shippingOrder.update({
    where: { Id: id },
    data: { TrackingCode: trackingCode }
  });

  publishToQueue(queues.PREPARE_TO_SHIP, {
    shipping_order_id: shippingOrder.Id
  });
  publishToQueue(queues.UPDATE_TRACKING, {
    shipping_order_id: shippingOrder.Id,
    shipping_status: SHIPPING_STATUS.IN_PREPARATION
  });

  res.status(200).json({ tracking_code: trackingCode });
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
  handlePrepareToShip,
  handleDeleteShippingOrder
};
