import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Utente, UtenteDocument } from './schemas/utente.schema';
import { CreateUtenteDto } from './dto/create-utente.dto';
import { UpdateUtenteDto } from './dto/update-utente.dto';
import { PaginatedResponse } from '../common/types';

@Injectable()
export class UtentiService {
  private readonly logger = new Logger(UtentiService.name);

  constructor(
    @InjectModel(Utente.name) private utenteModel: Model<UtenteDocument>,
  ) {}

  /**
   * Crea un nuovo utente
   * @param createUtenteDto Dati dell'utente da creare
   * @returns L'utente creato
   */
  async create(createUtenteDto: CreateUtenteDto): Promise<Utente> {
    this.logger.log(`Creazione nuovo utente: ${createUtenteDto.email}`);

    // Verifica se esiste già un utente con la stessa email
    const existingUser = await this.findByEmail(createUtenteDto.email);
    if (existingUser) {
      this.logger.warn(
        `Tentativo di creare un utente con email già esistente: ${createUtenteDto.email}`,
      );
      throw new ConflictException(
        `Utente con email ${createUtenteDto.email} già esistente`,
      );
    }

    try {
      const newUtente = new this.utenteModel(createUtenteDto);
      const savedUtente = await newUtente.save();
      return this.sanitizeUser(savedUtente.toObject());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Errore durante la creazione dell'utente: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Trova tutti gli utenti con opzioni di paginazione e filtri
   * @param options Opzioni di ricerca e paginazione
   * @returns Lista paginata di utenti
   */
  async findAll(options: {
    page: number;
    limit: number;
    filtri?: {
      ruolo?: string;
      attivo?: boolean;
      search?: string;
    };
  }): Promise<PaginatedResponse<Utente>> {
    const { page = 1, limit = 10, filtri } = options;
    const skip = (page - 1) * limit;

    this.logger.debug(
      `Ricerca utenti - page: ${page}, limit: ${limit}, filtri: ${JSON.stringify(filtri)}`,
    );

    // Costruisci la query con i filtri
    const query: FilterQuery<UtenteDocument> = {};

    if (filtri) {
      if (filtri.ruolo) {
        query.ruolo = filtri.ruolo;
      }

      if (filtri.attivo !== undefined) {
        query.attivo = filtri.attivo;
      }

      if (filtri.search) {
        query.$or = [
          { nome: { $regex: filtri.search, $options: 'i' } },
          { cognome: { $regex: filtri.search, $options: 'i' } },
          { email: { $regex: filtri.search, $options: 'i' } },
        ];
      }
    }

    try {
      // Esegui la query e la conta in parallelo per ottimizzare le performance
      const [utenti, total] = await Promise.all([
        this.utenteModel
          .find(query)
          .select('-password -refreshToken') // Escludi campi sensibili
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }) // Ordina per data di creazione decrescente
          .lean() // Usa lean() per migliorare le performance
          .exec(),

        this.utenteModel.countDocuments(query).exec(),
      ]);

      return {
        data: utenti.map((u) => this.sanitizeUser(u)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Errore durante il recupero degli utenti: ${error.message}`,
          error instanceof Error ? error.stack : undefined,
        );
      } else {
        this.logger.error(
          'Errore durante il recupero degli utenti: Errore sconosciuto',
        );
      }
      throw error;
    }
  }

  /**
   * Trova un utente specifico per ID
   * @param id ID dell'utente
   * @returns Utente trovato
   */
  async findOne(id: string): Promise<Utente> {
    this.logger.debug(`Ricerca utente con ID: ${id}`);

    try {
      // Verifica che l'ID sia un ObjectId valido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`ID utente non valido: ${id}`);
      }

      const utente = await this.utenteModel
        .findById(id)
        .select('-password -refreshToken')
        .lean()
        .exec();

      if (!utente) {
        this.logger.warn(`Utente con ID ${id} non trovato`);
        throw new NotFoundException(`Utente con ID ${id} non trovato`);
      }

      return utente;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Errore durante il recupero dell'utente: ${
            error instanceof Error ? error.message : 'Errore sconosciuto'
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  /**
   * Trova un utente per email
   * @param email Email dell'utente
   * @returns Documento utente o null se non trovato
   */
  async findByEmail(email: string): Promise<UtenteDocument | null> {
    this.logger.debug(`Ricerca utente con email: ${email}`);

    try {
      return this.utenteModel.findOne({ email }).exec();
    } catch (error) {
      this.logger.error(
        `Errore durante la ricerca per email: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
  /**
   * Aggiorna un utente
   * @param id ID dell'utente da aggiornare
   * @param updateUtenteDto Dati di aggiornamento
   * @returns Utente aggiornato
   */
  async update(id: string, updateUtenteDto: UpdateUtenteDto): Promise<Utente> {
    this.logger.log(`Aggiornamento utente con ID: ${id}`);

    try {
      // Verifica che l'ID sia un ObjectId valido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`ID utente non valido: ${id}`);
      }

      const updateData: Partial<UpdateUtenteDto & { password?: string }> = {
        ...updateUtenteDto,
      };
      // Se viene fornita una nuova password, hashala prima dell'aggiornamento
      if (updateData.password && typeof updateData.password === 'string') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateData.password, salt);
        updateData.password = hashedPassword;
      }

      // Se si sta aggiornando l'email, verifica che non sia già in uso
      if (updateUtenteDto.email) {
        const existingUser = await this.utenteModel.findOne({
          email: updateUtenteDto.email,
          _id: { $ne: id }, // Esclude l'utente corrente dalla ricerca
        });

        if (existingUser) {
          throw new ConflictException(
            `Email ${updateUtenteDto.email} già in uso`,
          );
        }
      }

      const utente = await this.utenteModel
        .findByIdAndUpdate(id, updateUtenteDto, {
          new: true, // Restituisce il documento aggiornato
          runValidators: true, // Applica i validatori dello schema
        })
        .select('-password -refreshToken')
        .lean()
        .exec();

      if (!utente) {
        this.logger.warn(
          `Tentativo di aggiornare un utente inesistente: ${id}`,
        );
        throw new NotFoundException(`Utente con ID ${id} non trovato`);
      }

      return utente;
    } catch (error) {
      if (
        !(error instanceof NotFoundException) &&
        !(error instanceof ConflictException)
      ) {
        this.logger.error(
          `Errore durante l'aggiornamento dell'utente: ${
            error instanceof Error ? error.message : 'Errore sconosciuto'
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  /**
   * Rimuove un utente
   * @param id ID dell'utente da rimuovere
   * @returns Conferma dell'eliminazione
   */
  async remove(id: string): Promise<{ deleted: boolean }> {
    this.logger.log(`Rimozione utente con ID: ${id}`);

    try {
      // Verifica che l'ID sia un ObjectId valido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`ID utente non valido: ${id}`);
      }

      const result = await this.utenteModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        this.logger.warn(`Tentativo di eliminare un utente inesistente: ${id}`);
        throw new NotFoundException(`Utente con ID ${id} non trovato`);
      }

      return { deleted: true };
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Errore durante la rimozione dell'utente: ${
            error instanceof Error ? error.message : 'Errore sconosciuto'
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  /**
   * Imposta il token di refresh per un utente
   * @param userId ID dell'utente
   * @param refreshToken Nuovo token di refresh o null per rimuoverlo
   */
  async setRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    this.logger.debug(`Aggiornamento refresh token per l'utente: ${userId}`);

    try {
      // Verifica che l'ID sia un ObjectId valido
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new NotFoundException(`ID utente non valido: ${userId}`);
      }

      // Hash del token prima di salvarlo (se non è null)
      let tokenToStore = refreshToken;
      if (refreshToken) {
        const salt = await bcrypt.genSalt(10);
        tokenToStore = await bcrypt.hash(refreshToken, salt);
      }

      const result = await this.utenteModel
        .updateOne({ _id: userId }, { refreshToken: tokenToStore })
        .exec();

      if (result.matchedCount === 0) {
        throw new NotFoundException(`Utente con ID ${userId} non trovato`);
      }
    } catch (error) {
      this.logger.error(
        `Errore durante l'aggiornamento del refresh token: ${
          error instanceof Error ? error.message : 'Errore sconosciuto'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Aggiorna la data dell'ultimo accesso di un utente
   * @param userId ID dell'utente
   */
  async updateUltimoAccesso(
    userId: mongoose.Types.ObjectId | string,
  ): Promise<void> {
    this.logger.debug(`Aggiornamento ultimo accesso per l'utente`);

    try {
      let id: mongoose.Types.ObjectId;

      // Converti l'ID nel formato corretto per MongoDB
      if (typeof userId === 'string') {
        // Verifica che la stringa sia un ObjectId valido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new NotFoundException(`ID utente non valido: ${userId}`);
        }
        id = new mongoose.Types.ObjectId(userId);
      } else {
        id = userId;
      }

      const result = await this.utenteModel
        .updateOne({ _id: id }, { ultimoAccesso: new Date() })
        .exec();

      if (result.matchedCount === 0) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new NotFoundException(`Utente con ID ${id} non trovato`);
      }
    } catch (error) {
      this.logger.error(
        `Errore durante l'aggiornamento dell'ultimo accesso: ${
          error instanceof Error ? error.message : 'Errore sconosciuto'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Rimuove i campi sensibili da un oggetto utente
   * @param user Oggetto utente da sanitizzare
   * @returns Oggetto utente senza campi sensibili
   */
  private sanitizeUser(user: Record<string, any>): Utente {
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.refreshToken;
    return sanitized as Utente;
  }

  /**
   * Verifica le credenziali di un utente
   * @param email Email dell'utente
   * @param password Password in chiaro
   * @returns L'utente se le credenziali sono valide, null altrimenti
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UtenteDocument | null> {
    this.logger.debug(`Validazione credenziali per l'email: ${email}`);

    try {
      // Trova l'utente per email
      const utente = await this.findByEmail(email);

      if (!utente) {
        return null;
      }

      // Verifica la password
      const isPasswordValid = await utente.comparePassword(password);

      if (!isPasswordValid) {
        return null;
      }

      // Cast esplicito dell'ID per risolvere il problema di tipizzazione
      if (utente._id) {
        const id = utente._id as unknown as mongoose.Types.ObjectId;
        await this.updateUltimoAccesso(id);
      }

      return utente;
    } catch (error) {
      this.logger.error(
        `Errore durante la validazione delle credenziali: ${
          error instanceof Error ? error.message : 'Errore sconosciuto'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
