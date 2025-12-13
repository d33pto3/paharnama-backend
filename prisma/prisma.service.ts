// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '../lib/prisma';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client = prisma;

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  // Expose the Prisma client methods
  get db() {
    return this.client;
  }
}
