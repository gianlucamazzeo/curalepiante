import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('=== AVVIO APPLICAZIONE ===');
  console.log('MongoDB URI:', process.env.MONGODB_URI || 'Non definito');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Non definito');

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `=== APPLICAZIONE AVVIATA sulla porta: ${process.env.PORT ?? 3000} ===`,
  );
}
bootstrap().catch((err) => {
  console.error('=== ERRORE DURANTE AVVIO ===', err);
});
