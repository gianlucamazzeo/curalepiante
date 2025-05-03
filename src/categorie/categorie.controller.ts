// src/categorie/categorie.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategorieService } from './categorie.service';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginatedResponse } from '../common/types';
import { Categoria } from './schemas/categoria.schema';

@Controller('categorie')
export class CategorieController {
  constructor(private readonly categorieService: CategorieService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categorieService.create(createCategoriaDto);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('attiva') attiva?: boolean,
    @Query('search') search?: string,
  ): Promise<PaginatedResponse<Categoria>> {
    return this.categorieService.findAll({
      page,
      limit,
      filtri: {
        attiva,
        search,
      },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categorieService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categorieService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categorieService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.categorieService.remove(id);
  }
}
