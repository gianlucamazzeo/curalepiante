// src/categorie/categorie.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Categoria, CategoriaDocument } from './schemas/categoria.schema';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { PaginatedResponse } from '../common/types';

@Injectable()
export class CategorieService {
  private readonly logger = new Logger(CategorieService.name);

  constructor(
    @InjectModel(Categoria.name)
    private categoriaModel: Model<CategoriaDocument>,
  ) {}

  /**
   * Crea una nuova categoria
   * @param createCategoriaDto Dati della categoria da creare
   * @returns La categoria creata
   */
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    this.logger.log(`Creazione nuova categoria: ${createCategoriaDto.nome}`);

    try {
      // Se lo slug non è stato fornito, lo generiamo dal nome
      if (!createCategoriaDto.slug && createCategoriaDto.nome) {
        createCategoriaDto.slug = createCategoriaDto.nome
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Verifica se esiste già una categoria con lo stesso nome o slug
      const esisteGia = await this.categoriaModel.findOne({
        $or: [
          { nome: createCategoriaDto.nome },
          { slug: createCategoriaDto.slug },
        ],
      });

      if (esisteGia) {
        if (esisteGia.nome === createCategoriaDto.nome) {
          throw new ConflictException(
            `Esiste già una categoria con il nome "${createCategoriaDto.nome}"`,
          );
        }
        if (esisteGia.slug === createCategoriaDto.slug) {
          throw new ConflictException(
            `Esiste già una categoria con lo slug "${createCategoriaDto.slug}"`,
          );
        }
      }

      const nuovaCategoria = new this.categoriaModel(createCategoriaDto);
      return nuovaCategoria.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error(
        `Errore durante la creazione della categoria: ${
          error instanceof Error ? error.message : 'Errore sconosciuto'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Trova tutte le categorie con opzioni di paginazione e filtri
   * @param options Opzioni di ricerca e paginazione
   * @returns Lista paginata di categorie
   */
  async findAll(options: {
    page: number;
    limit: number;
    filtri?: {
      attiva?: boolean;
      search?: string;
    };
  }): Promise<PaginatedResponse<Categoria>> {
    const { page = 1, limit = 10, filtri } = options;
    const skip = (page - 1) * limit;

    this.logger.debug(
      `Ricerca categorie - page: ${page}, limit: ${limit}, filtri: ${JSON.stringify(filtri)}`,
    );

    // Costruisci la query con i filtri
    const query: FilterQuery<CategoriaDocument> = {};

    if (filtri) {
      if (filtri.attiva !== undefined) {
        query.attiva = filtri.attiva;
      }

      if (filtri.search) {
        query.$or = [
          { nome: { $regex: filtri.search, $options: 'i' } },
          { descrizione: { $regex: filtri.search, $options: 'i' } },
          { slug: { $regex: filtri.search, $options: 'i' } },
        ];
      }
    }

    try {
      // Esegui la query e la conta in parallelo per ottimizzare le performance
      const [categorie, total] = await Promise.all([
        this.categoriaModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .sort({ ordine: 1, nome: 1 }) // Ordina per ordine, poi per nome
          .lean()
          .exec(),

        this.categoriaModel.countDocuments(query).exec(),
      ]);

      return {
        data: categorie,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Errore durante il recupero delle categorie: ${
          error instanceof Error ? error.message : 'Errore sconosciuto'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Trova una categoria specifica per ID
   * @param id ID della categoria
   * @returns Categoria trovata
   */
  async findOne(id: string): Promise<Categoria> {
    this.logger.debug(`Ricerca categoria con ID: ${id}`);

    try {
      // Verifica che l'ID sia un ObjectId valido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`ID categoria non valido: ${id}`);
      }

      const categoria = await this.categoriaModel.findById(id).lean().exec();

      if (!categoria) {
        this.logger.warn(`Categoria con ID ${id} non trovata`);
        throw new NotFoundException(`Categoria con ID ${id} non trovata`);
      }

      return categoria;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Errore durante il recupero della categoria: ${
            error instanceof Error ? error.message : 'Errore sconosciuto'
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  /**
   * Trova una categoria specifica per slug
   * @param slug Slug della categoria
   * @returns Categoria trovata
   */
  async findBySlug(slug: string): Promise<Categoria> {
    this.logger.debug(`Ricerca categoria con slug: ${slug}`);

    try {
      const categoria = await this.categoriaModel
        .findOne({ slug })
        .lean()
        .exec();

      if (!categoria) {
        this.logger.warn(`Categoria con slug ${slug} non trovata`);
        throw new NotFoundException(`Categoria con slug ${slug} non trovata`);
      }

      return categoria;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Errore durante il recupero della categoria per slug: ${
            error instanceof Error ? error.message : 'Errore sconosciuto'
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  /**
   * Aggiorna una categoria
   * @param id ID della categoria da aggiornare
   * @param updateCategoriaDto Dati di aggiornamento
   * @returns Categoria aggiornata
   */
  async update(
    id: string,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    this.logger.log(`Aggiornamento categoria con ID: ${id}`);

    try {
      // Verifica che l'ID sia un ObjectId valido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`ID categoria non valido: ${id}`);
      }

      // Se si sta aggiornando lo slug o il nome, verifica che non sia già in uso
      if (updateCategoriaDto.nome || updateCategoriaDto.slug) {
        const query: FilterQuery<CategoriaDocument> = { _id: { $ne: id } };
        const orConditions: Array<{ nome?: string; slug?: string }> = [];

        if (updateCategoriaDto.nome) {
          orConditions.push({ nome: updateCategoriaDto.nome });
        }

        if (updateCategoriaDto.slug) {
          orConditions.push({ slug: updateCategoriaDto.slug });
        }

        if (orConditions.length > 0) {
          query.$or = orConditions;
          const esisteGia = await this.categoriaModel.findOne(query);

          if (esisteGia) {
            if (esisteGia.nome === updateCategoriaDto.nome) {
              throw new ConflictException(
                `Esiste già una categoria con il nome "${updateCategoriaDto.nome}"`,
              );
            }
            if (esisteGia.slug === updateCategoriaDto.slug) {
              throw new ConflictException(
                `Esiste già una categoria con lo slug "${updateCategoriaDto.slug}"`,
              );
            }
          }
        }
      }

      const categoria = await this.categoriaModel
        .findByIdAndUpdate(id, updateCategoriaDto, {
          new: true, // Restituisce il documento aggiornato
          runValidators: true, // Applica i validatori dello schema
        })
        .lean()
        .exec();

      if (!categoria) {
        this.logger.warn(
          `Tentativo di aggiornare una categoria inesistente: ${id}`,
        );
        throw new NotFoundException(`Categoria con ID ${id} non trovata`);
      }

      return categoria;
    } catch (error) {
      if (
        !(error instanceof NotFoundException) &&
        !(error instanceof ConflictException)
      ) {
        this.logger.error(
          `Errore durante l'aggiornamento della categoria: ${
            error instanceof Error ? error.message : 'Errore sconosciuto'
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  /**
   * Rimuove una categoria
   * @param id ID della categoria da rimuovere
   * @returns Conferma dell'eliminazione
   */
  async remove(id: string): Promise<{ deleted: boolean; message: string }> {
    this.logger.log(`Rimozione categoria con ID: ${id}`);

    try {
      // Verifica che l'ID sia un ObjectId valido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`ID categoria non valido: ${id}`);
      }

      const result = await this.categoriaModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        this.logger.warn(
          `Tentativo di eliminare una categoria inesistente: ${id}`,
        );
        throw new NotFoundException(`Categoria con ID ${id} non trovata`);
      }

      return {
        deleted: true,
        message: 'Categoria eliminata con successo',
      };
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Errore durante la rimozione della categoria: ${
            error instanceof Error ? error.message : 'Errore sconosciuto'
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }
}
