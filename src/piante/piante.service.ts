// src/piante/piante.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { PianteQueryDto } from './dto/piante-query.dto';
import { Pianta, PianteListaResponse } from './interfaces/pianta.interface';

@Injectable()
export class PianteService {
  private readonly logger = new Logger(PianteService.name);
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
      return response;
    } catch (error) {
      this.logger.error(
        `Errore generale nel servizio piante: ${
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
        'Servizio piante non disponibile',
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
    } catch (error) {
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
