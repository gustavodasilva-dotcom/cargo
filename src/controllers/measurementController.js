const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const handleGetAll = async function (_req, res) {
  const records = await prisma.measurement.findMany();
  if (records.length === 0) return res.sendStatus(204);
  const result = records.map((record) => {
    return {
      id: record.Id,
      name: record.Name,
      conversion_factor: record.ConversionFactor,
      base_unit: record.BaseUnit
    };
  });
  return res.json([...result]);
};

module.exports = { handleGetAll };
