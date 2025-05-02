import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'nestjs-pino';
import { Request as ExpressRequest } from 'express';

// Define a custom interface that extends Express.Request
interface CustomRequest extends ExpressRequest {
  id: string;
  params: Record<string, any>;
  method: string;
  url: string;
  body: Record<string, any>;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<CustomRequest>();

    const { method, url, body } = request;
    const query = request.query as Record<string, any>;
    const params = request.params;
    const userAgent = request.get('user-agent') || '';
    const requestId = request.id;

    // Log della richiesta in ingresso
    this.logger.debug(`Request ${method} ${url}`, {
      context: 'API',
      requestId,
      method,
      url,
      body,
      params,
      query,
      userAgent,
    });

    const now = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;

          // Log della risposta con tempo di esecuzione
          this.logger.debug(`Response ${method} ${url} - ${responseTime}ms`, {
            context: 'API',
            requestId,
            method,
            url,
            responseTime,
            status: 'success',
          });
        },
        error: () => {
          const responseTime = Date.now() - now;

          // Non loghiamo l'errore qui perché verrà gestito dall'ErrorInterceptor
          this.logger.debug(
            `Response ${method} ${url} - ${responseTime}ms - Errore`,
            {
              context: 'API',
              requestId,
              method,
              url,
              responseTime,
              status: 'error',
            },
          );
        },
      }),
    );
  }
}
