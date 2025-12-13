import { prisma } from './lib/prisma';

async function main() {
  const mountain = await prisma.mountain.create({
    data: {
      altitude: '8848m',
      has_death_zone: true,
      translations: {
        create: [
          { language: 'en', name: 'Mount Everest', location: 'Nepal/China' },
          { language: 'bn', name: 'মাউন্ট এভারেস্ট', location: 'নেপাল/চীন' },
        ],
      },
    },
    include: { translations: true },
  });
  console.log('Created mountain:', mountain);

  const allMountains = await prisma.mountain.findMany({
    include: { translations: true },
  });
  console.log('All mountains:', JSON.stringify(allMountains, null, 2));
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
