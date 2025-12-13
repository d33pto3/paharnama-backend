import 'dotenv/config';
import xlsx from 'xlsx';
import { prisma } from '../../lib/prisma';

type Row = {
  mountain_key: string;
  altitude?: string;
  has_death_zone: boolean;
  language: string;
  key: string;
  location?: string;
};

async function sync() {
  const workbook = xlsx.readFile('prisma/seeds/mountains.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<Row>(sheet);

  console.log(`🔄 Syncing ${rows.length} rows...`);

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const hasDeathZone =
        typeof row.has_death_zone === 'string'
          ? (row.has_death_zone as string).toLowerCase() === 'true'
          : !!row.has_death_zone;

      const mountain = await tx.mountain.upsert({
        where: { key: row.key },
        update: {
          altitude: row.altitude,
          has_death_zone: hasDeathZone,
        },
        create: {
          key: row.key,
          altitude: row.altitude,
          has_death_zone: hasDeathZone,
        },
      });

      await tx.mountainTranslation.upsert({
        where: {
          mountainId_language: {
            mountainId: mountain.id,
            language: row.language,
          },
        },
        update: {
          name: row.key,
          location: row.location || '',
        },
        create: {
          mountainId: mountain.id,
          language: row.language,
          name: row.key,
          location: row.location || '',
        },
      });
    }
  });

  console.log('✅ Mountain sync completed');
}

sync()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Sync failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
