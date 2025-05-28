import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PianteService } from './piante.service';
import { PianteQueryDto } from './dto/piante-query.dto';
import { CreatePiantaDto } from './dto/create-pianta.dto';
import { UpdatePiantaDto } from './dto/update-pianta.dto';
import { PianteListaResponse, Pianta } from './interfaces/pianta.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/piante')
@UseInterceptors(CacheInterceptor)
export class PianteController {
  constructor(private readonly pianteService: PianteService) {}

  @Get()
  @CacheTTL(3600)
  async getPiante(
    @Query() query: PianteQueryDto,
  ): Promise<PianteListaResponse> {
    return this.pianteService.getPiante(query);
  }

  @Get(':id')
  @CacheTTL(3600)
  async getPiantaById(@Param('id') id: string): Promise<Pianta> {
    return this.pianteService.getPiantaById(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createPianta(
    @Body() createPiantaDto: CreatePiantaDto,
  ): Promise<Pianta> {
    // Ensure default_image is never undefined, only null or the object
    const dto = {
      ...createPiantaDto,
      default_image: createPiantaDto.default_image ?? null,
    };
    return this.pianteService.createPianta(dto as Omit<Pianta, 'id'>);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updatePianta(
    @Param('id') id: string,
    @Body() updatePiantaDto: UpdatePiantaDto,
  ): Promise<Pianta> {
    return this.pianteService.updatePianta(Number(id), updatePiantaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePianta(@Param('id') id: string): Promise<void> {
    return this.pianteService.deletePianta(Number(id));
  }
}
