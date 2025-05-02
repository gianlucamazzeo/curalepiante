// src/common/providers/interceptors.provider.ts
import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { ErrorInterceptor } from '../interceptors/error.interceptor';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

export const interceptorProviders: Provider[] = [
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ErrorInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: TransformInterceptor,
  },
];
