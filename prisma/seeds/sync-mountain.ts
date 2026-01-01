import 'dotenv/config';
import * as xlsx from 'xlsx';
import { prisma } from '../../lib/prisma';

type Row = {
  key: string;
  language: string;
  description?: string;
  altitude?: string;
  has_death_zone: string | boolean;
  location?: string;
  first_climber?: string;
  first_climbed_date?: string;
  mountain_img?: string;
  country_flag_img?: string;
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
          ? row.has_death_zone.toLowerCase() === 'true'
          : !!row.has_death_zone;

      // Parse date if provided and valid
      let firstClimbedDate: Date | null = null;
      if (row.first_climbed_date) {
        const parsedDate = new Date(row.first_climbed_date);
        if (!isNaN(parsedDate.getTime())) {
          firstClimbedDate = parsedDate;
        }
      }

      // Upsert Mountain record
      const mountain = await tx.mountain.upsert({
        where: { key: row.key },
        update: {
          altitude: row.altitude,
          has_death_zone: hasDeathZone,
          first_climbed_date: firstClimbedDate,
          mountain_img: row.mountain_img,
          country_flag_img: row.country_flag_img,
        },
        create: {
          key: row.key,
          altitude: row.altitude,
          has_death_zone: hasDeathZone,
          first_climbed_date: firstClimbedDate,
          mountain_img: row.mountain_img,
          country_flag_img: row.country_flag_img,
        },
      });

      // Upsert MountainTranslation record
      await tx.mountainTranslation.upsert({
        where: {
          mountainId_language: {
            mountainId: mountain.id,
            language: row.language,
          },
        },
        update: {
          name: row.key,
          description: row.description ?? null,
          location: row.location ?? null,
          first_climber: row.first_climber ?? null,
        },
        create: {
          mountainId: mountain.id,
          language: row.language,
          name: row.key,
          description: row.description ?? null,
          location: row.location ?? null,
          first_climber: row.first_climber ?? null,
        },
      });
    }
  }, {
    timeout: 30000,
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
