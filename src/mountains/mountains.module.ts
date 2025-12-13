import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { MountainsService } from './mountains.service';
import { MountainsController } from './mountains.controller';

@Module({
  imports: [PrismaModule],
  providers: [MountainsService],
  controllers: [MountainsController],
})
export class MountainsModule {}
