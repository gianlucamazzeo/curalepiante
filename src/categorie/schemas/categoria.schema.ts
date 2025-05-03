import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, CallbackError } from 'mongoose';

export type CategoriaDocument = Categoria & Document;

@Schema({ timestamps: true })
export class Categoria {
  @Prop({ required: true, unique: true })
  nome: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  descrizione: string;

  @Prop({ default: 0 })
  ordine: number;

  @Prop({ default: true })
  attiva: boolean;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);

// Aggiungiamo indici per migliorare le performance
CategoriaSchema.index({ slug: 1 }, { unique: true });
CategoriaSchema.index({ ordine: 1 });

// Questo hook assicura che il nome della collezione sia 'categorie' in MongoDB
CategoriaSchema.set('collection', 'categorie');

// Hook per validare e formattare i dati prima di salvarli
CategoriaSchema.pre('save', async function (next) {
  try {
    // Se lo slug non è stato fornito, lo generiamo dal nome
    if (!this.slug && this.nome) {
      this.slug = this.nome
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Verifica se esiste già una categoria con lo stesso nome o slug
    const model = this.constructor as Model<CategoriaDocument>;

    // Non includiamo il documento corrente nella ricerca se stiamo aggiornando
    const query = this.isNew
      ? { $or: [{ nome: this.nome }, { slug: this.slug }] }
      : {
          $or: [{ nome: this.nome }, { slug: this.slug }],
          _id: { $ne: this._id },
        };

    const existingCategory = await model.findOne(query);

    if (existingCategory) {
      if (existingCategory.nome === this.nome) {
        return next(
          new Error(`Esiste già una categoria con il nome "${this.nome}"`),
        );
      }
      if (existingCategory.slug === this.slug) {
        return next(
          new Error(`Esiste già una categoria con lo slug "${this.slug}"`),
        );
      }
    }

    next();
  } catch (error) {
    next(error as CallbackError);
  }
});
