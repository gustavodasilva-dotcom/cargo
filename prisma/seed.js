const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const measurementData = [
  {
    id: '18350560-ca92-4841-af35-cdf9dd47bd6d',
    name: 'Unity',
    conversionFactor: 1,
    baseUnit: 'Unity'
  },
  {
    id: '4fb20fea-fd4f-4078-b055-012177a62d99',
    name: 'Gram',
    conversionFactor: 1,
    baseUnit: 'Gram'
  },
  {
    id: '6d857b34-caa9-4d33-bbd8-988ea19ac75f',
    name: 'Kilogram',
    conversionFactor: 1000,
    baseUnit: 'Gram'
  },
  {
    id: 'd28d10ae-01af-4dd4-b954-b51491112ca5',
    name: 'Milligram',
    conversionFactor: 0.001,
    baseUnit: 'Gram'
  },
  {
    id: '7b1263cc-b91b-4c17-a56d-2dbce49971ab',
    name: 'Liter',
    conversionFactor: 1,
    baseUnit: 'Liter'
  },
  {
    id: 'bf9cdb8d-df9e-4461-aed4-8486fe58c5ac',
    name: 'Milliliter',
    conversionFactor: 0.001,
    baseUnit: 'Liter'
  },
  {
    id: '4c25b822-671f-4478-af02-269fa081dfdb',
    name: 'Cubic Meter',
    conversionFactor: 1000,
    baseUnit: 'Liter'
  },
  {
    id: 'ec60a913-decc-454e-85b1-798590f5ff9c',
    name: 'Inch',
    conversionFactor: 1,
    baseUnit: 'Inch'
  },
  {
    id: '6b4a27c6-2dd9-47dd-b4c1-ccb6b6348526',
    name: 'Foot',
    conversionFactor: 12,
    baseUnit: 'Inch'
  },
  {
    id: 'df8ca00f-5960-4465-8a45-482da9171bf0',
    name: 'Yard',
    conversionFactor: 36,
    baseUnit: 'Inch'
  }
];

async function main() {
  console.log('[server] Start seeding...');
  const upsertPromises = measurementData.map(
    async ({ id, name, conversionFactor, baseUnit }) => {
      const data = {
        Name: name,
        ConversionFactor: conversionFactor,
        BaseUnit: baseUnit
      };
      await prisma.measurement.upsert({
        where: { Id: id },
        update: data,
        create: { Id: id, ...data }
      });
    }
  );
  await Promise.all(upsertPromises);
  console.log('[server] Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to start SQL Server connection through Prisma:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
