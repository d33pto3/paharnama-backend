import { PartialType } from '@nestjs/mapped-types';
import { CreateMountainDto } from './create-mountain.dto';

export class UpdateMountainDto extends PartialType(CreateMountainDto) {}
