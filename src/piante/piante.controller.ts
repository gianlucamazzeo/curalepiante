// src/piante/piante.controller.ts
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PianteService } from './piante.service';
import { PianteQueryDto } from './dto/piante-query.dto';
import { PianteListaResponse, Pianta } from './interfaces/pianta.interface';

@Controller('api/piante')
@UseInterceptors(CacheInterceptor)
export class PianteController {
  constructor(private readonly pianteService: PianteService) {}

  @Get()
  @CacheTTL(3600) // Cache di 1 ora
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
}
