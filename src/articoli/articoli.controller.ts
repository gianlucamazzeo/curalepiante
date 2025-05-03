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
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { ArticoliService } from './articoli.service';
import { CreateArticoloDto } from './dto/create-articolo.dto';
import { UpdateArticoloDto } from './dto/update-articolo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginatedResponse } from '../common/types';
import { Articolo } from './schemas/articolo.schema';

@Controller('articoli')
export class ArticoliController {
  constructor(private readonly articoliService: ArticoliService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createArticoloDto: CreateArticoloDto) {
    return {
      message: 'Articolo creato con successo',
      data: await this.articoliService.create(createArticoloDto),
    };
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('pubblicato') pubblicato?: boolean,
    @Query('inEvidenza') inEvidenza?: boolean,
    @Query('categoriaPrincipale') categoriaPrincipale?: string,
    @Query('categorieSecondarie') categorieSecondarie?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @Query('ordinamento') ordinamento?: string,
  ): Promise<PaginatedResponse<Articolo>> {
    // Controlla se l'utente è admin
    const user = req.user as { ruolo?: string } | undefined;
    const isAdmin = user?.ruolo === 'ADMIN';

    // Processa i parametri di filtro
    const categorieSecondarieArray = categorieSecondarie
      ? categorieSecondarie.split(',')
      : undefined;

    const tagsArray = tags ? tags.split(',') : undefined;

    return this.articoliService.findAll({
      page,
      limit,
      filtri: {
        pubblicato,
        inEvidenza,
        categoriaPrincipale,
        categorieSecondarie: categorieSecondarieArray,
        tags: tagsArray,
        search,
        ordinamento,
      },
      admin: isAdmin,
    });
  }

  @Get('in-evidenza')
  async getArticoliInEvidenza(@Query('limit') limit: number = 5) {
    return {
      message: 'Articoli in evidenza recuperati con successo',
      data: await this.articoliService.getArticoliInEvidenza(limit),
    };
  }

  @Get('popolari')
  async getArticoliPopolari(@Query('limit') limit: number = 5) {
    return {
      message: 'Articoli popolari recuperati con successo',
      data: await this.articoliService.getArticoliPopolari(limit),
    };
  }

  @Get('correlati/:id')
  async getArticoliCorrelati(
    @Param('id') id: string,
    @Query('limit') limit: number = 4,
  ) {
    return {
      message: 'Articoli correlati recuperati con successo',
      data: await this.articoliService.getArticoliCorrelati(id, limit),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      message: 'Articolo recuperato con successo',
      data: await this.articoliService.findById(id),
    };
  }

  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('incrementaVisualizzazioni') incrementaVisualizzazioni?: boolean,
  ) {
    return {
      message: 'Articolo recuperato con successo',
      data: await this.articoliService.findBySlug(
        slug,
        incrementaVisualizzazioni === true,
      ),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateArticoloDto: UpdateArticoloDto,
  ) {
    return {
      message: 'Articolo aggiornato con successo',
      data: await this.articoliService.update(id, updateArticoloDto),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return {
      message: 'Articolo eliminato con successo',
      data: await this.articoliService.remove(id),
    };
  }

  @Post(':id/mi-piace')
  @HttpCode(HttpStatus.OK)
  async gestisciMiPiace(
    @Param('id') id: string,
    @Body('identificatore') identificatore: string,
    @Req() req: Request,
  ) {
    if (!identificatore) {
      throw new BadRequestException('Identificatore richiesto');
    }

    const userAgent = req.headers['user-agent'] || '';

    return {
      message: 'Operazione mi piace completata con successo',
      data: await this.articoliService.gestisciMiPiace(
        id,
        identificatore,
        userAgent,
      ),
    };
  }
}
