import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // your PostgreSQL URL
    },
  },
});
