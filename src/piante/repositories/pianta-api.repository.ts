import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { PianteQueryDto } from '../dto/piante-query.dto';
import { Pianta, PianteListaResponse } from '../interfaces/pianta.interface';
import { IPiantaRepository } from '../interfaces/pianta-repository.interface';

@Injectable()
export class PiantaApiRepository implements IPiantaRepository {
  private readonly logger = new Logger(PiantaApiRepository.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('PERENUAL_API_URL') ?? '';
    this.apiKey = this.configService.get<string>('PERENUAL_API_KEY') ?? '';

    if (!this.apiUrl || !this.apiKey) {
      this.logger.error('API Perenual non configurata correttamente');
      throw new Error('Configurazione API Perenual mancante');
    }
  }

  async getPiante(query: PianteQueryDto): Promise<PianteListaResponse> {
    try {
      this.logger.debug(
        `Richiesta piante con parametri: ${JSON.stringify(query)}`,
      );

      const params = new URLSearchParams();
      params.append('key', this.apiKey);
      params.append('page', query.page?.toString() || '1');

      if (query.indoor !== undefined) {
        params.append('indoor', query.indoor ? '1' : '0');
      }

      if (query.flowers !== undefined) {
        params.append('flowers', query.flowers ? '1' : '0');
      }

      if (query.search) {
        params.append('q', query.search);
      }

      if (query.watering) {
        params.append('watering', query.watering);
      }

      if (query.edible !== undefined) {
        params.append('edible', query.edible ? '1' : '0');
      }

      const url = `${this.apiUrl}/species-list?${params.toString()}`;

      const response = await firstValueFrom(
        this.httpService.get<PianteListaResponse>(url).pipe(
          map((res) => res.data),
          catchError((error: any) => {
            this.logger.error(
              `Errore durante la chiamata API a Perenual: ${
                typeof error === 'object' &&
                error !== null &&
                'message' in error
                  ? (error as { message: string }).message
                  : String(error)
              }`,
              typeof error === 'object' && error !== null && 'stack' in error
                ? (error as { stack?: string }).stack
                : undefined,
            );
            throw new HttpException(
              'Errore nel recupero dei dati delle piante',
              HttpStatus.BAD_GATEWAY,
            );
          }),
        ),
      );

      this.logger.debug(
        `Ricevuti ${response.data.length} risultati da Perenual API`,
      );

      const enrichedData = await Promise.all(
        response.data.map(async (pianta) => {
          try {
            const detailedPianta = await this.getPiantaById(pianta.id);
            return {
              ...pianta,
              watering: detailedPianta.watering ?? pianta.watering,
              sunlight: detailedPianta.sunlight ?? pianta.sunlight,
              indoor: detailedPianta.indoor ?? pianta.indoor,
              flowers: detailedPianta.flowers ?? pianta.flowers,
              fruits: detailedPianta.fruits ?? pianta.fruits,
              cuisine: detailedPianta.cuisine ?? pianta.cuisine,
              medicinal: detailedPianta.medicinal ?? pianta.medicinal,
              poisonous_to_pets:
                detailedPianta.poisonous_to_pets ?? pianta.poisonous_to_pets,
              edible: detailedPianta.edible ?? pianta.edible,
              pruning_count:
                detailedPianta.pruning_count ?? pianta.pruning_count,
            };
          } catch (error: unknown) {
            this.logger.warn(
              `Impossibile recuperare dettagli per pianta ID ${pianta.id}: ${
                typeof error === 'object' &&
                error !== null &&
                'message' in error
                  ? (error as { message: string }).message
                  : String(error)
              }`,
            );
            return pianta;
          }
        }),
      );

      return {
        ...response,
        data: enrichedData,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Errore generale nel repository API piante: ${
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : String(error)
        }`,
        typeof error === 'object' &&
          error !== null &&
          'stack' in error &&
          typeof (error as { stack?: unknown }).stack === 'string'
          ? (error as { stack: string }).stack
          : undefined,
      );
      throw new HttpException(
        'Servizio piante API non disponibile',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getPiantaById(id: number): Promise<Pianta> {
    try {
      const url = `${this.apiUrl}/species/details/${id}?key=${this.apiKey}`;

      const response = await firstValueFrom(
        this.httpService.get<Pianta>(url).pipe(
          map((res) => res.data),
          catchError((error: unknown) => {
            let message = 'Errore sconosciuto';
            let stack: string | undefined = undefined;
            if (typeof error === 'object' && error !== null) {
              if (
                'message' in error &&
                typeof (error as { message?: unknown }).message === 'string'
              ) {
                message = (error as { message: string }).message;
              }
              if (
                'stack' in error &&
                typeof (error as { stack?: unknown }).stack === 'string'
              ) {
                stack = (error as { stack: string }).stack;
              }
            }
            this.logger.error(
              `Errore durante il recupero della pianta ID ${id}: ${message}`,
              stack,
            );
            throw new HttpException('Pianta non trovata', HttpStatus.NOT_FOUND);
          }),
        ),
      );

      return response;
    } catch (error: unknown) {
      this.logger.error(
        `Errore nel recupero della pianta ID ${id}: ${
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : String(error)
        }`,
        typeof error === 'object' &&
          error !== null &&
          'stack' in error &&
          typeof (error as { stack?: unknown }).stack === 'string'
          ? (error as { stack: string }).stack
          : undefined,
      );
      throw new HttpException(
        'Errore nel recupero dei dettagli della pianta',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}