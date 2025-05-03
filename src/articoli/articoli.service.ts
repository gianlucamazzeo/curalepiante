import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Articolo, ArticoloDocument } from './schemas/articolo.schema';
import { CreateArticoloDto } from './dto/create-articolo.dto';
import { UpdateArticoloDto } from './dto/update-articolo.dto';
import { PaginatedResponse } from '../common/types';

@Injectable()
export class ArticoliService {
  private readonly logger = new Logger(ArticoliService.name);

  constructor(
    @InjectModel(Articolo.name) private articoloModel: Model<ArticoloDocument>,
  ) {}

  /**
   * Crea un nuovo articolo
   * @param createArticoloDto Dati dell'articolo da creare
   * @returns L'articolo creato
   */
  async create(createArticoloDto: CreateArticoloDto): Promise<Articolo> {
    this.logger.log(`Creazione nuovo articolo: ${createArticoloDto.titolo}`);

    try {
      // Verifica se esiste già un articolo con lo stesso slug (se fornito)
      if (createArticoloDto.slug) {
        const existingArticolo = await this.findBySlug(createArticoloDto.slug);
        if (existingArticolo) {
          this.logger.warn(`Slug '${createArticoloDto.slug}' già in uso`);
          throw new ConflictException(
            `Slug '${createArticoloDto.slug}' già in uso`,
          );
        }
      }

      const newArticolo = new this.articoloModel(createArticoloDto);
      return await newArticolo.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante la creazione dell'articolo: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Trova tutti gli articoli con opzioni di paginazione e filtri
   * @param options Opzioni di ricerca e paginazione
   * @returns Lista paginata di articoli
   */
  async findAll(options: {
    page: number;
    limit: number;
    filtri?: {
      pubblicato?: boolean;
      inEvidenza?: boolean;
      categoriaPrincipale?: string;
      categorieSecondarie?: string[];
      tags?: string[];
      search?: string;
      ordinamento?: string;
    };
    admin?: boolean; // Se true, mostra anche articoli non pubblicati (solo admin)
  }): Promise<PaginatedResponse<Articolo>> {
    const { page = 1, limit = 10, filtri, admin = false } = options;
    const skip = (page - 1) * limit;

    this.logger.debug(
      `Ricerca articoli - page: ${page}, limit: ${limit}, filtri: ${JSON.stringify(filtri)}, admin: ${admin}`,
    );

    // Costruisci la query con i filtri
    const query: FilterQuery<ArticoloDocument> = {};

    // Se non è una richiesta admin, mostra solo articoli pubblicati
    if (!admin) {
      query.pubblicato = true;
    }

    if (filtri) {
      // Filtra per stato pubblicato se specificato
      if (filtri.pubblicato !== undefined && admin) {
        query.pubblicato = filtri.pubblicato;
      }

      // Filtra per evidenza
      if (filtri.inEvidenza !== undefined) {
        query.inEvidenza = filtri.inEvidenza;
      }

      // Filtra per categoria principale
      if (filtri.categoriaPrincipale) {
        if (!mongoose.Types.ObjectId.isValid(filtri.categoriaPrincipale)) {
          throw new BadRequestException('ID categoria principale non valido');
        }
        query.categoriaPrincipale = new mongoose.Types.ObjectId(
          filtri.categoriaPrincipale,
        );
      }

      // Filtra per categorie secondarie
      if (filtri.categorieSecondarie && filtri.categorieSecondarie.length > 0) {
        const validIds = filtri.categorieSecondarie
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));

        if (validIds.length > 0) {
          query.categorieSecondarie = { $in: validIds };
        }
      }

      // Filtra per tags
      if (filtri.tags && filtri.tags.length > 0) {
        query.tags = { $in: filtri.tags };
      }

      // Ricerca full-text
      if (filtri.search) {
        query.$or = [
          { titolo: { $regex: filtri.search, $options: 'i' } },
          { descrizione: { $regex: filtri.search, $options: 'i' } },
          { tags: { $regex: filtri.search, $options: 'i' } },
        ];
      }
    }

    try {
      // Determinare l'ordinamento
      let sortOptions: string | { [key: string]: mongoose.SortOrder } = {
        dataPubblicazione: -1,
      }; // Default: dal più recente

      if (filtri?.ordinamento) {
        switch (filtri.ordinamento) {
          case 'titolo_asc':
            sortOptions = { titolo: 1 };
            break;
          case 'titolo_desc':
            sortOptions = { titolo: -1 };
            break;
          case 'data_asc':
            sortOptions = { dataPubblicazione: 1 };
            break;
          case 'data_desc':
            sortOptions = { dataPubblicazione: -1 };
            break;
          case 'popolarita':
            sortOptions = { conteggioMiPiace: -1, visualizzazioni: -1 };
            break;
          case 'visualizzazioni':
            sortOptions = { visualizzazioni: -1 };
            break;
          default:
            sortOptions = { dataPubblicazione: -1 };
        }
      }

      // Esegui la query e la conta in parallelo per ottimizzare le performance
      const [articoli, total] = await Promise.all([
        this.articoloModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .sort(sortOptions)
          .populate('categoriaPrincipale')
          .populate('categorieSecondarie')
          .lean()
          .exec(),

        this.articoloModel.countDocuments(query).exec(),
      ]);

      return {
        data: articoli,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante il recupero degli articoli: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Trova un articolo per ID
   * @param id ID dell'articolo
   * @returns L'articolo trovato
   */
  async findById(id: string): Promise<Articolo> {
    this.logger.debug(`Ricerca articolo con ID: ${id}`);

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`ID articolo non valido: ${id}`);
      }

      const articolo = await this.articoloModel
        .findById(id)
        .populate('categoriaPrincipale')
        .populate('categorieSecondarie')
        .lean()
        .exec();

      if (!articolo) {
        this.logger.warn(`Articolo con ID ${id} non trovato`);
        throw new NotFoundException(`Articolo con ID ${id} non trovato`);
      }

      return articolo;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante il recupero dell'articolo: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Trova un articolo per slug
   * @param slug Slug dell'articolo
   * @param incrementaVisualizzazioni Se true, incrementa il contatore delle visualizzazioni
   * @returns L'articolo trovato
   */
  async findBySlug(
    slug: string,
    incrementaVisualizzazioni: boolean = false,
  ): Promise<Articolo> {
    this.logger.debug(`Ricerca articolo con slug: ${slug}`);

    try {
      const articolo = await this.articoloModel
        .findOne({ slug })
        .populate('categoriaPrincipale')
        .populate('categorieSecondarie')
        .exec();

      if (!articolo) {
        this.logger.warn(`Articolo con slug ${slug} non trovato`);
        throw new NotFoundException(`Articolo con slug ${slug} non trovato`);
      }

      // Incrementa il contatore delle visualizzazioni se richiesto
      if (incrementaVisualizzazioni) {
        articolo.visualizzazioni += 1;
        await articolo.save();
      }

      return articolo.toObject();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante il recupero dell'articolo per slug: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Aggiorna un articolo
   * @param id ID dell'articolo da aggiornare
   * @param updateArticoloDto Dati di aggiornamento
   * @returns L'articolo aggiornato
   */
  async update(
    id: string,
    updateArticoloDto: UpdateArticoloDto,
  ): Promise<Articolo> {
    this.logger.log(`Aggiornamento articolo con ID: ${id}`);

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`ID articolo non valido: ${id}`);
      }

      // Verifica se l'articolo esiste
      const existingArticolo = await this.articoloModel.findById(id);
      if (!existingArticolo) {
        this.logger.warn(
          `Articolo con ID ${id} non trovato per l'aggiornamento`,
        );
        throw new NotFoundException(`Articolo con ID ${id} non trovato`);
      }

      // Aggiorna l'articolo
      const updatedArticolo = await this.articoloModel
        .findByIdAndUpdate(id, updateArticoloDto, {
          new: true, // Restituisci il documento aggiornato
          runValidators: true, // Applica i validatori dello schema
        })
        .populate('categoriaPrincipale')
        .populate('categorieSecondarie')
        .exec();

      if (!updatedArticolo) {
        throw new NotFoundException(
          `Articolo con ID ${id} non trovato dopo l'aggiornamento`,
        );
      }
      return updatedArticolo.toObject();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante l'aggiornamento dell'articolo: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Elimina un articolo
   * @param id ID dell'articolo da eliminare
   * @returns Messaggio di conferma
   */
  async remove(id: string): Promise<{ deleted: boolean; message: string }> {
    this.logger.log(`Eliminazione articolo con ID: ${id}`);

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`ID articolo non valido: ${id}`);
      }

      const result = await this.articoloModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        this.logger.warn(
          `Articolo con ID ${id} non trovato per l'eliminazione`,
        );
        throw new NotFoundException(`Articolo con ID ${id} non trovato`);
      }

      return {
        deleted: true,
        message: `Articolo con ID ${id} eliminato con successo`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante l'eliminazione dell'articolo: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Gestisce un mi piace per un articolo
   * @param articleId ID dell'articolo
   * @param identificatore Identificatore univoco dell'utente
   * @param userAgent User agent del client
   * @param fingerprint Fingerprint opzionale per identificazione aggiuntiva
   */
  async gestisciMiPiace(
    articleId: string,
    identificatore: string,
    userAgent: string,
    fingerprint?: string,
  ): Promise<{ liked: boolean; count: number }> {
    this.logger.debug(
      `Gestione mi piace per articolo ${articleId} da ${identificatore}`,
    );

    try {
      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new BadRequestException(`ID articolo non valido: ${articleId}`);
      }

      // Trova l'articolo
      const articolo = await this.articoloModel.findById(articleId);
      if (!articolo) {
        throw new NotFoundException(`Articolo con ID ${articleId} non trovato`);
      }

      // Verifica se l'utente ha già messo like controllando l'array miPiaceAnonimi
      const existingLike = articolo.miPiaceAnonimi.some(
        (like) => like.identificatore === identificatore,
      );

      if (existingLike) {
        // Rimuovi il like manualmente invece di usare il metodo dello schema
        const index = articolo.miPiaceAnonimi.findIndex(
          (like) => like.identificatore === identificatore,
        );
        if (index !== -1) {
          articolo.miPiaceAnonimi.splice(index, 1);
          articolo.conteggioMiPiace = articolo.miPiaceAnonimi.length;
          await articolo.save();
        }

        return {
          liked: false,
          count: articolo.conteggioMiPiace,
        };
      } else {
        // Aggiungi il like manualmente invece di usare il metodo dello schema
        const ora = new Date();

        // Controllo limiti e validazioni
        const chiaveTentativo = ora.toISOString().slice(0, 10);
        if (!articolo.tentativiLike) {
          articolo.tentativiLike = {};
        }

        if (!articolo.tentativiLike[chiaveTentativo]) {
          articolo.tentativiLike[chiaveTentativo] = 0;

          // Pulisci le chiavi vecchie
          const chiavi = Object.keys(articolo.tentativiLike).sort();
          while (chiavi.length > 7) {
            const vecchiaChiave = chiavi.shift();
            if (vecchiaChiave) delete articolo.tentativiLike[vecchiaChiave];
          }
        }

        // Incrementa tentativo
        articolo.tentativiLike[chiaveTentativo] += 1;

        // Controllo limite di mi piace giornalieri per questo identificatore
        const limite = 10;
        const mieiTentativiOggi = articolo.miPiaceAnonimi
          .filter((like) => like.identificatore === identificatore)
          .filter((like) => {
            const dataLike = new Date(
              like.ultimoAggiornamento || like.dataCreazione,
            );
            return dataLike.toISOString().slice(0, 10) === chiaveTentativo;
          }).length;

        if (mieiTentativiOggi >= limite) {
          throw new BadRequestException(
            'Limite di interazioni raggiunto per oggi',
          );
        }

        // Valida userAgent
        if (!userAgent || userAgent.length < 20) {
          throw new BadRequestException('User agent non valido');
        }

        // Controlla pattern di bot
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
          throw new BadRequestException('Rilevato potenziale bot');
        }

        // Aggiungi mi piace
        articolo.miPiaceAnonimi.push({
          identificatore,
          userAgent,
          fingerprint,
          dataCreazione: ora,
          ultimoAggiornamento: ora,
        });

        articolo.conteggioMiPiace = articolo.miPiaceAnonimi.length;
        await articolo.save();

        return {
          liked: true,
          count: articolo.conteggioMiPiace,
        };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante la gestione del mi piace: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Ottiene articoli in evidenza
   * @param limit Numero massimo di articoli da restituire
   * @returns Array di articoli in evidenza
   */
  async getArticoliInEvidenza(limit: number = 5): Promise<Articolo[]> {
    this.logger.debug(`Recupero ${limit} articoli in evidenza`);

    try {
      const articoli = await this.articoloModel
        .find({ pubblicato: true, inEvidenza: true })
        .limit(limit)
        .sort({ dataPubblicazione: -1 })
        .populate('categoriaPrincipale')
        .lean()
        .exec();

      return articoli;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante il recupero degli articoli in evidenza: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Ottiene gli articoli più popolari
   * @param limit Numero massimo di articoli da restituire
   * @returns Array di articoli più popolari
   */
  async getArticoliPopolari(limit: number = 5): Promise<Articolo[]> {
    this.logger.debug(`Recupero ${limit} articoli più popolari`);

    try {
      const articoli = await this.articoloModel
        .find({ pubblicato: true })
        .limit(limit)
        .sort({ conteggioMiPiace: -1, visualizzazioni: -1 })
        .populate('categoriaPrincipale')
        .lean()
        .exec();

      return articoli;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante il recupero degli articoli più popolari: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  /**
   * Ottiene articoli correlati in base a categorie e tag
   * @param articoloId ID dell'articolo di riferimento
   * @param limit Numero massimo di articoli da restituire
   * @returns Array di articoli correlati
   */
  async getArticoliCorrelati(
    articoloId: string,
    limit: number = 4,
  ): Promise<Articolo[]> {
    this.logger.debug(`Recupero ${limit} articoli correlati a ${articoloId}`);

    try {
      if (!mongoose.Types.ObjectId.isValid(articoloId)) {
        throw new BadRequestException(`ID articolo non valido: ${articoloId}`);
      }

      // Trova l'articolo di riferimento
      const articolo = await this.articoloModel.findById(articoloId).exec();
      if (!articolo) {
        throw new NotFoundException(
          `Articolo con ID ${articoloId} non trovato`,
        );
      }

      // Costruisci query per trovare articoli simili
      const query: FilterQuery<ArticoloDocument> = {
        _id: { $ne: articoloId }, // Escludi l'articolo corrente
        pubblicato: true,
        $or: [
          { categoriaPrincipale: articolo.categoriaPrincipale },
          { categorieSecondarie: { $in: articolo.categorieSecondarie } },
        ],
      };

      // Aggiungi condizione per tag se presenti
      if (articolo.tags && articolo.tags.length > 0) {
        query.$or = query.$or || [];
        query.$or.push({ tags: { $in: articolo.tags } });
      }

      const articoliCorrelati = await this.articoloModel
        .find(query)
        .limit(limit)
        .sort({ dataPubblicazione: -1 })
        .populate('categoriaPrincipale')
        .lean()
        .exec();

      return articoliCorrelati;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Errore durante il recupero degli articoli correlati: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }
}
