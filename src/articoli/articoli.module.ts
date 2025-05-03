import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Articolo, ArticoloSchema } from './schemas/articolo.schema';
import { ArticoliController } from './articoli.controller';
import { ArticoliService } from './articoli.service';
import { CategorieModule } from '../categorie/categorie.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Articolo.name, schema: ArticoloSchema },
    ]),
    CategorieModule, // Importiamo CategorieModule per accedere al CategorieService
  ],
  controllers: [ArticoliController],
  providers: [ArticoliService],
  exports: [ArticoliService], // Esportiamo il service se altri moduli ne hanno bisogno
})
export class ArticoliModule {}
