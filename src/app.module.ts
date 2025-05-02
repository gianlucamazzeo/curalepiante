import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

import databaseConfig from './config/database';
import { loggerConfig } from './config/logger.config';

@Module({
  imports: [
    // Configurazione
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    // Logger
    LoggerModule.forRoot(loggerConfig),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ThrottlerModule.forRoot([
      {
        ttl: 60, // 60 richieste per IP
        limit: 60, // 1 minuto
      },
    ]),

    // Connessione MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        // Impostazioni per la gestione della connessione
        connectionFactory: (connection: import('mongoose').Connection) => {
          connection.on('error', (error: Error) => {
            console.error('Errore di connessione MongoDB:', error);
          });
          return connection;
        },
      }),
    }),

    // Altri moduli
    DatabaseModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Applica rate limiting globalmente
    {
      provide: APP_GUARD,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
