// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { MongoDBService } from '../database/mongodb.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private mongoDBService: MongoDBService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Verifica connessione MongoDB
      () => this.mongoose.pingCheck('mongodb', { timeout: 1500 }),
    ]);
  }

  @Get('db-status')
  getDatabaseStatus() {
    return {
      status: this.mongoDBService.getConnectionStatus(),
      timestamp: new Date().toISOString(),
    };
  }
}
