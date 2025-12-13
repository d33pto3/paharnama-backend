import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MountainsService } from './mountains.service';
import { CreateMountainDto } from './dto/create-mountain.dto';
import { UpdateMountainDto } from './dto/update-mountain.dto';

@Controller('mountains')
export class MountainsController {
  constructor(private mountainsService: MountainsService) {}

  @Post()
  create(@Body() dto: CreateMountainDto) {
    return this.mountainsService.create(dto);
  }

  @Get()
  findAll(@Query('lang') lang: string = 'en') {
    return this.mountainsService.findAll(lang);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string = 'en',
  ) {
    return this.mountainsService.findOne(id, lang);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMountainDto,
  ) {
    return this.mountainsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mountainsService.remove(id);
  }
}
