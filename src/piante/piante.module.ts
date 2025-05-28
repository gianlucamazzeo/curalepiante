import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PianteController } from './piante.controller';
import { PianteService } from './piante.service';
import { Pianta, PiantaSchema } from './schemas/pianta.schema';
import { PiantaApiRepository } from './repositories/pianta-api.repository';
import { PiantaMongoRepository } from './repositories/pianta-mongodb.repository';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([{ name: Pianta.name, schema: PiantaSchema }]),
  ],
  controllers: [PianteController],
  providers: [
    PianteService,
    PiantaApiRepository,
    PiantaMongoRepository,
    {
      provide: 'PIANTA_REPOSITORY',
      useFactory: (
        configService: ConfigService,
        apiRepository: PiantaApiRepository,
        mongoRepository: PiantaMongoRepository,
      ) => {
        const useDatabase = configService.get<boolean>(
          'USE_DATABASE_FOR_PLANTS',
          false,
        );
        return useDatabase ? mongoRepository : apiRepository;
      },
      inject: [ConfigService, PiantaApiRepository, PiantaMongoRepository],
    },
  ],
  exports: [PianteService],
})
export class PianteModule {}
