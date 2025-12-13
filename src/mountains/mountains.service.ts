import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMountainDto } from './dto/create-mountain.dto';
import { UpdateMountainDto } from './dto/update-mountain.dto';

@Injectable()
export class MountainsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMountainDto) {
    const { translations, ...mountainData } = dto;
    return this.prisma.db.mountain.create({
      data: {
        key: mountainData.key,
        has_death_zone: mountainData.hasDeathZone,
        first_climbed_date: mountainData?.first_climbed_date
          ? new Date(mountainData.first_climbed_date)
          : undefined,
        mountain_img: mountainData.mountain_img,
        country_flag_img: mountainData.country_flag_img,
        translations: { create: translations },
      },
      include: { translations: true },
    });
  }

  findAll(language = 'en') {
    return this.prisma.db.mountain.findMany({
      include: { translations: { where: { language } } },
    });
  }

  findOne(id: number, language = 'en') {
    return this.prisma.db.mountain.findUnique({
      where: { id },
      include: { translations: { where: { language } } },
    });
  }

  async update(id: number, dto: UpdateMountainDto) {
    const { translations, ...mountainData } = dto;
    await this.prisma.db.mountain.update({ where: { id }, data: mountainData });

    if (translations) {
      for (const t of translations) {
        await this.prisma.db.mountainTranslation.upsert({
          where: {
            mountainId_language: { mountainId: id, language: t.language },
          },
          update: t,
          create: { ...t, mountainId: id },
        });
      }
    }

    return this.findOne(id);
  }

  remove(id: number) {
    return this.prisma.db.mountain.delete({ where: { id } });
  }
}
