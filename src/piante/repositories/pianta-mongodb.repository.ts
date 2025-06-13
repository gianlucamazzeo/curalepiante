import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PianteQueryDto } from '../dto/piante-query.dto';
import {
  Pianta as PiantaInterface,
  PianteListaResponse,
} from '../interfaces/pianta.interface';
import { IPiantaRepository } from '../interfaces/pianta-repository.interface';
import { Pianta, PiantaDocument } from '../schemas/pianta.schema';

@Injectable()
export class PiantaMongoRepository implements IPiantaRepository {
  private readonly logger = new Logger(PiantaMongoRepository.name);

  constructor(
    @InjectModel(Pianta.name)
    private readonly piantaModel: Model<PiantaDocument>,
  ) {}

  async getPiante(query: PianteQueryDto): Promise<PianteListaResponse> {
    try {
      this.logger.debug(
        `Richiesta piante MongoDB con parametri: ${JSON.stringify(query)}`,
      );

      const page = query.page || 1;
      const limit = 30;
      const skip = (page - 1) * limit;

      const filter: any = {};

      if (query.indoor !== undefined) {
        filter.indoor = query.indoor;
      }

      if (query.flowers !== undefined) {
        filter.flowers = query.flowers;
      }

      if (query.search) {
        filter.$or = [
          { common_name: { $regex: query.search, $options: 'i' } },
          { scientific_name: { $regex: query.search, $options: 'i' } },
          { other_name: { $regex: query.search, $options: 'i' } },
        ];
      }

      if (query.watering) {
        filter.watering = { $regex: query.watering, $options: 'i' };
      }

      if (query.edible !== undefined) {
        filter.edible = query.edible;
      }

      const [data, total] = await Promise.all([
        this.piantaModel.find(filter).skip(skip).limit(limit).lean().exec(),
        this.piantaModel.countDocuments(filter).exec(),
      ]);

      const lastPage = Math.ceil(total / limit);

      return {
        data: data.map((doc) => ({
          id: doc.id,
          common_name: doc.common_name,
          scientific_name: doc.scientific_name,
          other_name: doc.other_name,
          cycle: doc.cycle,
          watering: doc.watering,
          sunlight: doc.sunlight,
          default_image: doc.default_image,
          indoor: doc.indoor,
          flowers: doc.flowers,
          fruits: doc.fruits,
          cuisine: doc.cuisine,
          medicinal: doc.medicinal,
          poisonous_to_pets: doc.poisonous_to_pets,
          edible: doc.edible,
          pruning_count: doc.pruning_count,
        })),
        to: Math.min(skip + limit, total),
        per_page: limit,
        current_page: page,
        from: skip + 1,
        last_page: lastPage,
        total,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Errore nel recupero piante da MongoDB: ${
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : String(error)
        }`,
      );
      throw new HttpException(
        'Errore nel recupero delle piante dal database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPiantaById(id: number): Promise<PiantaInterface> {
    try {
      const pianta = await this.piantaModel.findOne({ id }).lean().exec();

      if (!pianta) {
        throw new HttpException('Pianta non trovata', HttpStatus.NOT_FOUND);
      }

      return {
        id: pianta.id,
        common_name: pianta.common_name,
        scientific_name: pianta.scientific_name,
        other_name: pianta.other_name,
        cycle: pianta.cycle,
        watering: pianta.watering,
        sunlight: pianta.sunlight,
        default_image: pianta.default_image,
        indoor: pianta.indoor,
        flowers: pianta.flowers,
        fruits: pianta.fruits,
        cuisine: pianta.cuisine,
        medicinal: pianta.medicinal,
        poisonous_to_pets: pianta.poisonous_to_pets,
        edible: pianta.edible,
        pruning_count: pianta.pruning_count,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Errore nel recupero pianta ID ${id} da MongoDB: ${
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : String(error)
        }`,
      );
      throw new HttpException(
        'Errore nel recupero della pianta dal database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPianta(
    pianta: Omit<PiantaInterface, 'id'>,
  ): Promise<PiantaInterface> {
    try {
      const maxId = await this.piantaModel
        .findOne()
        .sort({ id: -1 })
        .lean()
        .exec();
      const newId = maxId ? maxId.id + 1 : 1;

      const newPianta = new this.piantaModel({
        ...pianta,
        id: newId,
      });

      const savedPianta = await newPianta.save();

      return {
        id: savedPianta.id,
        common_name: savedPianta.common_name,
        scientific_name: savedPianta.scientific_name,
        other_name: savedPianta.other_name,
        cycle: savedPianta.cycle,
        watering: savedPianta.watering,
        sunlight: savedPianta.sunlight,
        default_image: savedPianta.default_image,
        indoor: savedPianta.indoor,
        flowers: savedPianta.flowers,
        fruits: savedPianta.fruits,
        cuisine: savedPianta.cuisine,
        medicinal: savedPianta.medicinal,
        poisonous_to_pets: savedPianta.poisonous_to_pets,
        edible: savedPianta.edible,
        pruning_count: savedPianta.pruning_count,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Errore nella creazione pianta: ${
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : String(error)
        }`,
      );
      throw new HttpException(
        'Errore nella creazione della pianta',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePianta(
    id: number,
    updates: Partial<PiantaInterface>,
  ): Promise<PiantaInterface> {
    try {
      const updatedPianta = await this.piantaModel
        .findOneAndUpdate({ id }, updates, { new: true })
        .lean()
        .exec();

      if (!updatedPianta) {
        throw new HttpException('Pianta non trovata', HttpStatus.NOT_FOUND);
      }

      return {
        id: updatedPianta.id,
        common_name: updatedPianta.common_name,
        scientific_name: updatedPianta.scientific_name,
        other_name: updatedPianta.other_name,
        cycle: updatedPianta.cycle,
        watering: updatedPianta.watering,
        sunlight: updatedPianta.sunlight,
        default_image: updatedPianta.default_image,
        indoor: updatedPianta.indoor,
        flowers: updatedPianta.flowers,
        fruits: updatedPianta.fruits,
        cuisine: updatedPianta.cuisine,
        medicinal: updatedPianta.medicinal,
        poisonous_to_pets: updatedPianta.poisonous_to_pets,
        edible: updatedPianta.edible,
        pruning_count: updatedPianta.pruning_count,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Errore nell'aggiornamento pianta ID ${id}: ${
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : String(error)
        }`,
      );
      throw new HttpException(
        "Errore nell'aggiornamento della pianta",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePianta(id: number): Promise<void> {
    try {
      const result = await this.piantaModel.deleteOne({ id }).exec();

      if (result.deletedCount === 0) {
        throw new HttpException('Pianta non trovata', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Pianta ID ${id} eliminata con successo`);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Errore nell'eliminazione pianta ID ${id}: ${
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : String(error)
        }`,
      );
      throw new HttpException(
        "Errore nell'eliminazione della pianta",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
