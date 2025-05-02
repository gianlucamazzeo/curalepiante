// src/database/mongodb.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Logger } from 'nestjs-pino';

@Injectable()
export class MongoDBService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: Logger,
  ) {}

  onModuleInit() {
    this.setupConnectionListeners();
    this.logConnectionStatus();
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private setupConnectionListeners() {
    this.connection.on('connected', () => {
      this.logger.log('Connessione a MongoDB stabilita con successo', {
        context: 'MongoDB',
      });
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnesso', { context: 'MongoDB' });
    });

    this.connection.on('error', (err: Error) => {
      this.logger.error(`Errore di connessione MongoDB: ${err.message}`, {
        context: 'MongoDB',
        error: err,
      });
    });

    this.connection.on('reconnected', () => {
      this.logger.log('Riconnessione a MongoDB avvenuta con successo', {
        context: 'MongoDB',
      });
    });
  }

  private logConnectionStatus() {
    const statusMap = {
      0: 'disconnesso',
      1: 'connesso',
      2: 'connessione in corso',
      3: 'disconnessione in corso',
    };

    const status =
      statusMap[this.connection.readyState as keyof typeof statusMap] ||
      'stato sconosciuto';
    this.logger.log(`Stato attuale della connessione MongoDB: ${status}`, {
      context: 'MongoDB',
    });
  }

  private async closeConnection() {
    if (this.connection) {
      try {
        await this.connection.close();
        this.logger.log('Connessione a MongoDB chiusa correttamente', {
          context: 'MongoDB',
        });
      } catch (error: unknown) {
        this.logger.error(
          `Errore durante la chiusura della connessione MongoDB: ${
            error instanceof Error ? error.message : 'Errore sconosciuto'
          }`,
          {
            context: 'MongoDB',
            error,
          },
        );
      }
    }
  }

  /**
   * Metodo di utilità per tracciare le performance delle query MongoDB
   */
  async executeWithTracing<T>(
    collection: string,
    operation: string,
    queryFn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      this.logger.debug(
        `MongoDB: ${collection}.${operation} completata in ${executionTime}ms`,
        { context: 'MongoDB', collection, operation, executionTime },
      );

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.logger.error(
        `MongoDB: ${collection}.${operation} fallita dopo ${executionTime}ms: ${
          error instanceof Error ? error.message : 'Errore sconosciuto'
        }`,
        {
          context: 'MongoDB',
          collection,
          operation,
          executionTime,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
        },
      );

      throw error;
    }
  }

  /**
   * Restituisce lo stato attuale della connessione
   */
  getConnectionStatus(): string {
    const statusMap = {
      0: 'disconnesso',
      1: 'connesso',
      2: 'connessione in corso',
      3: 'disconnessione in corso',
    };

    return this.connection.readyState in statusMap
      ? statusMap[this.connection.readyState as keyof typeof statusMap]
      : 'stato sconosciuto';
  }
}
