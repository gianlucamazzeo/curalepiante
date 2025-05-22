import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class PianteExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PianteExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.error(
      `Errore nell'API piante: ${exception.message}`,
      exception.stack,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message: "Errore durante l'elaborazione della richiesta",
      error: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
