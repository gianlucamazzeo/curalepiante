import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Categoria } from '../../categorie/schemas/categoria.schema';
import {
  InfoCura,
  CondizioniCrescita,
  InfoParassitiMalattie,
  CaratteristichePianta,
  PhTerreno,
} from '../interfaces/articolo-properties.interface';

// Interfaccia per Link Prodotto
export interface LinkProdotto {
  url: string;
  descrizione: string;
  affiliatoAmazon: boolean;
}

// Schema per Link Prodotto
const LinkProdottoSchema = new MongooseSchema<LinkProdotto>({
  url: { type: String, required: true },
  descrizione: { type: String, required: true },
  affiliatoAmazon: { type: Boolean, default: false },
});

// Interfaccia per Immagine
export interface Immagine {
  url: string;
  altText: string;
  principale?: boolean;
}

// Schema per Immagine
const ImmagineSchema = new MongooseSchema<Immagine>({
  url: { type: String, required: true },
  altText: { type: String, required: true },
  principale: { type: Boolean, default: false },
});

// Interfaccia per il Mi Piace anonimo
export interface MiPiaceAnonimo {
  identificatore: string;
  userAgent?: string;
  fingerprint?: string;
  dataCreazione: Date;
  ultimoAggiornamento?: Date;
}

// Schema per Mi Piace anonimo
const MiPiaceAnonimoSchema = new MongooseSchema<MiPiaceAnonimo>({
  identificatore: { type: String, required: true },
  userAgent: { type: String },
  fingerprint: { type: String },
  dataCreazione: { type: Date, default: Date.now },
  ultimoAggiornamento: { type: Date },
});

// Schema per il pH del terreno
const PhTerrenoSchema = new MongooseSchema<PhTerreno>({
  min: { type: Number },
  max: { type: Number },
  ottimale: { type: Number },
});

// Schema per InfoCura
const InfoCuraSchema = new MongooseSchema<InfoCura>({
  frequenzaInnaffiatura: { type: String },
  esposizioneSole: { type: String },
  tipoTerreno: { type: String },
  phTerreno: { type: PhTerrenoSchema },
  concimazione: { type: String },
  potatura: { type: String },
  cureAggiuntive: { type: String },
});

// Schema per CondizioniCrescita
const CondizioniCrescitaSchema = new MongooseSchema<CondizioniCrescita>({
  rusticita: { type: String },
  temperaturaIdeale: { type: String },
  umidita: { type: String },
  velocitaCrescita: { type: String },
  livelloDifficolta: { type: String },
  internoEsterno: { type: String },
});

// Schema per InfoParassitiMalattie
const InfoParassitiMalattieSchema = new MongooseSchema<InfoParassitiMalattie>({
  parassitiComuni: { type: [String], default: [] },
  malattieComuni: { type: [String], default: [] },
  metodiPrevenzione: { type: [String], default: [] },
  trattamenti: { type: [String], default: [] },
});

// Schema per CaratteristichePianta
const CaratteristichePiantaSchema = new MongooseSchema<CaratteristichePianta>({
  commestibile: { type: Boolean, default: false },
  partiCommestibili: { type: [String], default: [] },
  tossicaUmani: { type: Boolean, default: false },
  tossicaAnimali: { type: Boolean, default: false },
  infestante: { type: Boolean, default: false },
  potenzialeInvasivo: { type: String },
  stagioneFioritura: { type: String },
  coloriFiori: { type: [String], default: [] },
});

export type ArticoloDocument = Articolo & Document;

@Schema({ timestamps: true })
export class Articolo {
  @Prop({ required: true })
  titolo: string;

  @Prop({ required: true })
  descrizione: string;

  @Prop({ required: false })
  contenuto?: string;

  @Prop({
    unique: true,
    index: true,
    // Slug generato automaticamente dal titolo se non fornito
    set: function (this: { titolo: string }, val: string): string {
      if (val) return val;

      return this.titolo
        ? this.titolo
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : '';
    },
  })
  slug: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Categoria',
    required: true,
  })
  categoriaPrincipale: Categoria | MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Categoria' }],
    default: [],
  })
  categorieSecondarie: (Categoria | MongooseSchema.Types.ObjectId)[];

  @Prop({ default: false })
  pubblicato: boolean;

  @Prop({ default: 0 })
  ordine: number;

  @Prop({ required: false })
  immagine?: string;

  @Prop({ type: [LinkProdottoSchema], default: [] })
  linkProdotti: LinkProdotto[];

  @Prop({ type: [ImmagineSchema], default: [] })
  immagini: Immagine[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  inEvidenza: boolean;

  @Prop({ default: 0 })
  visualizzazioni: number;

  @Prop({ type: [MiPiaceAnonimoSchema], default: [] })
  miPiaceAnonimi: MiPiaceAnonimo[];

  @Prop({ default: 0 })
  conteggioMiPiace: number;

  // Registra tentativi di like per controllare comportamenti sospetti
  @Prop({ type: Object, default: {} })
  tentativiLike: Record<string, number>;

  @Prop({ default: Date.now })
  dataPubblicazione?: Date;

  @Prop({ type: Object, default: {} })
  metadati?: Record<string, any>;

  // Nuove proprietà aggiunte
  @Prop({ type: InfoCuraSchema, default: {} })
  infoCura?: InfoCura;

  @Prop({ type: CondizioniCrescitaSchema, default: {} })
  condizioniCrescita?: CondizioniCrescita;

  @Prop({ type: InfoParassitiMalattieSchema, default: {} })
  infoParassitiMalattie?: InfoParassitiMalattie;

  @Prop({ type: CaratteristichePiantaSchema, default: {} })
  caratteristichePianta?: CaratteristichePianta;
}

export const ArticoloSchema = SchemaFactory.createForClass(Articolo);

// Aggiungi indici per migliorare le performance
ArticoloSchema.index({ titolo: 'text', descrizione: 'text', tags: 'text' });
ArticoloSchema.index({ categoriaPrincipale: 1 });
ArticoloSchema.index({ categorieSecondarie: 1 });
ArticoloSchema.index({ pubblicato: 1 });
ArticoloSchema.index({ inEvidenza: 1 });
ArticoloSchema.index({ dataPubblicazione: -1 });
ArticoloSchema.index({ conteggioMiPiace: -1 });
ArticoloSchema.index({ 'miPiaceAnonimi.identificatore': 1 }, { sparse: true });
ArticoloSchema.index({ 'caratteristichePianta.commestibile': 1 });
ArticoloSchema.index({ 'caratteristichePianta.infestante': 1 });
ArticoloSchema.index({ 'caratteristichePianta.stagioneFioritura': 1 });

// Pre-save hook per generare lo slug se non definito
ArticoloSchema.pre('save', function (this: ArticoloDocument, next) {
  if (!this.slug && this.titolo) {
    this.slug = this.titolo
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Imposta la data di pubblicazione se l'articolo viene pubblicato per la prima volta
  if (
    this.isModified('pubblicato') &&
    this.pubblicato &&
    !this.dataPubblicazione
  ) {
    this.dataPubblicazione = new Date();
  }

  // Aggiorna il conteggio dei mi piace se è cambiato l'array
  if (this.isModified('miPiaceAnonimi')) {
    this.conteggioMiPiace = this.miPiaceAnonimi.length;
  }

  next();
});

// Metodo per incrementare le visualizzazioni
ArticoloSchema.methods.incrementaVisualizzazioni = function (
  this: ArticoloDocument,
) {
  this.visualizzazioni += 1;
  return this.save();
};

// Metodo per aggiungere un mi piace anonimo con protezione anti-bot
ArticoloSchema.methods.aggiungiMiPiace = async function (
  this: ArticoloDocument,
  identificatore: string,
  userAgent?: string,
  fingerprint?: string,
) {
  // Controllo protezione anti-bot
  const ora = new Date();
  const chiaveTentativo = ora.toISOString().slice(0, 10); // Data come chiave (YYYY-MM-DD)

  // Inizializza il contatore per oggi se non esiste
  if (!this.tentativiLike[chiaveTentativo]) {
    this.tentativiLike[chiaveTentativo] = 0;

    // Pulisci le chiavi vecchie (mantieni solo ultimi 7 giorni)
    const chiavi = Object.keys(this.tentativiLike).sort();
    while (chiavi.length > 7) {
      const vecchiaChiave = chiavi.shift();
      if (vecchiaChiave) delete this.tentativiLike[vecchiaChiave];
    }
  }

  // Incrementa tentativo
  this.tentativiLike[chiaveTentativo] += 1;

  // Protezione contro troppe richieste dallo stesso identificatore
  // (massimo 10 like/dislike al giorno per utente)
  const limite = 10;
  const mieiTentativiOggi = this.miPiaceAnonimi
    .filter((like) => like.identificatore === identificatore)
    .filter((like) => {
      const dataLike = new Date(like.ultimoAggiornamento || like.dataCreazione);
      return dataLike.toISOString().slice(0, 10) === chiaveTentativo;
    }).length;

  if (mieiTentativiOggi >= limite) {
    throw new Error('Limite di interazioni raggiunto per oggi');
  }

  // Valida userAgent (blocca le stringhe vuote o troppo brevi)
  if (!userAgent || userAgent.length < 20) {
    throw new Error('User agent non valido');
  }

  // Blocca userAgent che contengono indicatori comuni di bot
  const botPatterns = [
    /bot/i,
    /crawl/i,
    /spider/i,
    /headless/i,
    /scrape/i,
    /python/i,
    /http/i,
    /request/i,
    /curl/i,
    /wget/i,
  ];

  if (botPatterns.some((pattern) => pattern.test(userAgent))) {
    throw new Error('Rilevato potenziale bot');
  }

  // Verifica se esiste già un mi piace con questo identificatore
  const indiceEsistente = this.miPiaceAnonimi.findIndex(
    (like: MiPiaceAnonimo) => like.identificatore === identificatore,
  );

  if (indiceEsistente === -1) {
    // Aggiungi nuovo like
    this.miPiaceAnonimi.push({
      identificatore,
      userAgent,
      fingerprint,
      dataCreazione: ora,
      ultimoAggiornamento: ora,
    });
  } else {
    // Aggiorna il timestamp dell'ultimo aggiornamento
    this.miPiaceAnonimi[indiceEsistente].ultimoAggiornamento = ora;

    // Aggiorna userAgent e fingerprint se forniti
    if (userAgent) this.miPiaceAnonimi[indiceEsistente].userAgent = userAgent;
    if (fingerprint)
      this.miPiaceAnonimi[indiceEsistente].fingerprint = fingerprint;
  }

  this.conteggioMiPiace = this.miPiaceAnonimi.length;
  return this.save();
};

// Metodo per rimuovere un mi piace anonimo
ArticoloSchema.methods.rimuoviMiPiace = function (
  this: ArticoloDocument,
  identificatore: string,
) {
  const indice = this.miPiaceAnonimi.findIndex(
    (like: MiPiaceAnonimo) => like.identificatore === identificatore,
  );

  if (indice !== -1) {
    this.miPiaceAnonimi.splice(indice, 1);
    this.conteggioMiPiace = this.miPiaceAnonimi.length;
    return this.save();
  }

  return Promise.resolve(this);
};

// Metodo per verificare se c'è un mi piace associato a un identificatore
ArticoloSchema.methods.haLike = function (
  this: ArticoloDocument,
  identificatore: string,
): boolean {
  return this.miPiaceAnonimi.some(
    (like: MiPiaceAnonimo) => like.identificatore === identificatore,
  );
};

// Metodo virtuale per ottenere l'URL completo dell'articolo
ArticoloSchema.virtual('url').get(function () {
  return `/articoli/${this.slug}`;
});

// Imposta il nome della collezione
ArticoloSchema.set('collection', 'articoli');
