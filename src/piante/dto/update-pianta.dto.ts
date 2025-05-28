import { PartialType } from '@nestjs/mapped-types';
import { CreatePiantaDto } from './create-pianta.dto';

export class UpdatePiantaDto extends PartialType(CreatePiantaDto) {}