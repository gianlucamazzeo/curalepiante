// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interface/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response & { statusCode?: number }>();
    const statusCode = response.statusCode ?? HttpStatus.OK;

    return next.handle().pipe(
      map((data: { message?: string; data?: T }) => ({
        success: statusCode < 400,
        statusCode,
        message: data?.message || 'Operazione completata con successo',
        data: data?.message ? (data.data as T) || null : (data as T),
        error: null,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
