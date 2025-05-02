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
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UtentiService } from './utenti.service';
import { CreateUtenteDto } from './dto/create-utente.dto';
import { UpdateUtenteDto } from './dto/update-utente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginatedResponse } from '../common/types';
import { Utente } from './schemas/utente.schema';

interface UserPayload {
  _id: string;
  email: string;
  ruolo: string;
  // altri campi rilevanti
}

@Controller('utenti')
@UseGuards(JwtAuthGuard) // Protegge tutti gli endpoint del controller
export class UtentiController {
  constructor(private readonly utentiService: UtentiService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Solo gli admin possono creare utenti
  create(@Body() createUtenteDto: CreateUtenteDto) {
    return this.utentiService.create(createUtenteDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Solo gli admin possono vedere tutti gli utenti
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('ruolo') ruolo?: string,
    @Query('attivo') attivo?: boolean,
    @Query('search') search?: string,
  ): Promise<PaginatedResponse<Utente>> {
    return this.utentiService.findAll({
      page,
      limit,
      filtri: {
        ruolo,
        attivo,
        search,
      },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.utentiService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Solo gli admin possono modificare gli utenti
  update(@Param('id') id: string, @Body() updateUtenteDto: UpdateUtenteDto) {
    return this.utentiService.update(id, updateUtenteDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Solo gli admin possono eliminare gli utenti
  remove(@Param('id') id: string) {
    return this.utentiService.remove(id);
  }

  // Endpoint per aggiornare la password (richiede autenticazione ma non necessariamente ruolo ADMIN)
  /*
    @Patch(':id/password')
    updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
      // Qui dovresti implementare la logica per verificare la password attuale
      // e aggiornare con la nuova password
      // Per esempio:
      // return this.utentiService.updatePassword(id, updatePasswordDto);
      // (devi implementare questo metodo nel service)
      throw new Error('Metodo non implementato');
    }
      */

  // Endpoint per il profilo dell'utente corrente
  @Get('me/profile')
  getProfile(@Req() req: Request) {
    const user = req.user as UserPayload;

    // Verifica che l'ID esista e sia una stringa
    if (!user || !user._id || typeof user._id !== 'string') {
      throw new UnauthorizedException('Utente non valido');
    }

    return this.utentiService.findOne(user._id);
  }
}
