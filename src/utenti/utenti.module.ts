import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Utente, UtenteSchema } from './schemas/utente.schema';
// Importa il controller e il service quando li avrai creati
import { UtentiController } from './utenti.controller';
import { UtentiService } from './utenti.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Utente.name, schema: UtenteSchema }]),
  ],
  controllers: [UtentiController],
  providers: [UtentiService],
  exports: [UtentiService], // Esporta il service per l'AuthModule
})
export class UtentiModule {}
