// src/piante/piante.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PianteController } from './piante.controller';
import { PianteService } from './piante.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [PianteController],
  providers: [PianteService],
  exports: [PianteService],
})
export class PianteModule {}
