import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse } from '../interface/api-response.interface';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ErrorInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      catchError((error: unknown) => {
        let status: HttpStatus;
        let errorMessage: string;

        if (error instanceof HttpException) {
          status = error.getStatus();
          const errorResponse = error.getResponse();

          // Gestione degli errori di validazione
          if (typeof errorResponse === 'object' && 'message' in errorResponse) {
            errorMessage = Array.isArray(errorResponse.message)
              ? errorResponse.message.join(', ')
              : (errorResponse.message as string);
          } else {
            errorMessage = error.message;
          }
        } else {
          // Errori non HTTP (es. database, ecc.)
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          errorMessage = 'Si è verificato un errore interno';

          // Log dell'errore completo per debug
          this.logger.error(
            `Errore non gestito: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
            error instanceof Error ? error.stack : undefined,
            {
              path: request.url,
              method: request.method,
            },
          );
        }

        const errorResponse: ApiResponse<null> = {
          success: false,
          statusCode: status,
          message: "Errore durante l'elaborazione della richiesta",
          data: null,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return throwError(() => new HttpException(errorResponse, status));
      }),
    );
  }
}
