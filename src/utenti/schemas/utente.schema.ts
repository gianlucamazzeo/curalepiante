import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface UtenteDocument extends Utente, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

@Schema({ timestamps: true, collection: 'utentes' })
export class Utente {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  nome: string;

  @Prop({ required: true })
  cognome: string;

  @Prop({ enum: ['ADMIN', 'UTENTE_STANDARD'], default: 'UTENTE_STANDARD' })
  ruolo: string;

  @Prop({ default: true })
  attivo: boolean;

  @Prop()
  ultimoAccesso?: Date;

  @Prop()
  refreshToken?: string;
}

export const UtenteSchema = SchemaFactory.createForClass(Utente);

// Aggiungi un metodo per confrontare la password
UtenteSchema.methods.comparePassword = async function (
  this: UtenteDocument,
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hook pre-save per hashare la password
UtenteSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt: string = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
});
