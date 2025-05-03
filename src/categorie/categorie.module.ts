// src/categorie/categorie.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Categoria, CategoriaSchema } from './schemas/categoria.schema';
import { CategorieController } from './categorie.controller';
import { CategorieService } from './categorie.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categoria.name, schema: CategoriaSchema },
    ]),
  ],
  controllers: [CategorieController],
  providers: [CategorieService],
  exports: [CategorieService], // Esportiamo il service per permettere ad altri moduli di usarlo
})
export class CategorieModule {}
