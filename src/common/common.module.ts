// src/common/common.module.ts
import { Module, Global } from '@nestjs/common';
import { interceptorProviders } from './providers/interceptors.provider';

@Global()
@Module({
  providers: [...interceptorProviders],
  //  exports: [...interceptorProviders],
})
export class CommonModule {}
