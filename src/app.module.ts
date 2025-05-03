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
import { CommonModule } from './common/common.module';
import databaseConfig from './config/database';
import { loggerConfig } from './config/logger.config';
import { UtentiModule } from './utenti/utenti.module';
import { AuthModule } from './auth/auth.module';
import { CategorieModule } from './categorie/categorie.module';
import { ArticoliModule } from './articoli/articoli.module';
@Module({
  imports: [
    // Configurazione
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    // Logger
    LoggerModule.forRoot(loggerConfig),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 60, // 60 richieste per IP
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
    CommonModule,
    AuthModule,
    UtentiModule,
    DatabaseModule,
    HealthModule,
    CategorieModule,
    ArticoliModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Applica rate limiting globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
