const { Prisma, PrismaClient } = require('@prisma/client');
const { SHIPPING_PARTIES } = require('../enums/shippingParties');
const { SHIPPING_STATUS } = require('../enums/shippingStatus');
const { TRACKING_STATUS } = require('../enums/trackingStatus');
const { distinct } = require('../utils/arrayUtils');
const { generateRandomString } = require('../utils/stringUtils');
const { publishToQueue } = require('../rabbitmq/publisher');
const { queues } = require('../rabbitmq/queues');

const prisma = new PrismaClient();

const formatShippingPartyResponse = function (data) {
  return {
    id: data.Id,
    name: data.Name,
    email: data.Email,
    cellphone: data.Cellphone,
    address: data.Address
  };
};

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

  res.json({
    id: shippingOrder.Id,
    status: shippingOrder.Status,
    tracking_code: shippingOrder.TrackingCode,
    delivered_at: shippingOrder.DeliveredAt,
    shipped_at: shippingOrder.ShippedAt,
    senders: shippingOrder.Parties.filter(
      (party) => party.PartyType === SHIPPING_PARTIES.SENDER
    ).map(formatShippingPartyResponse),
    recipients: shippingOrder.Parties.filter(
      (party) => party.PartyType === SHIPPING_PARTIES.RECIPIENT
    ).map(formatShippingPartyResponse),
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

  if (shippingOrder.Status !== SHIPPING_STATUS.CREATED) {
    return res.status(400).json({
      title: 'Bad Request',
      detail: 'This shipping order is already in shipping.',
      instance: req.originalUrl,
      status: 400
    });
  }

  const trackingCode = `TC${new Date().getFullYear()}${generateRandomString(11)}`;

  await prisma.shippingOrder.update({
    where: { Id: id },
    data: {
      Status: SHIPPING_STATUS.IN_PREPARATION,
      TrackingCode: trackingCode
    }
  });

  await publishToQueue(queues.UPDATE_TRACKING, {
    shipping_order_id: shippingOrder.Id,
    tracking_status: TRACKING_STATUS.PREPARING_PACKAGE
  });
  await publishToQueue(queues.PREPARE_TO_SHIP, {
    shipping_order_id: shippingOrder.Id
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

  if (shippingOrder.Status !== SHIPPING_STATUS.CREATED) {
    return res.status(409).json({
      title: 'Conflict',
      detail: `This shipping order cannot be deleted, because it's already in shipping.`,
      instance: req.originalUrl,
      status: 409
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
