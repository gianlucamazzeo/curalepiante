<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


# NestJS Vercel

Backend API RESTful sviluppato con NestJS e ottimizzato per il deployment su Vercel.

## Descrizione

Questa è un'applicazione backend costruita con NestJS e ottimizzata per il deployment su Vercel. Il progetto implementa un'API RESTful con autenticazione JWT, integrazione con MongoDB tramite Mongoose, e varie funzionalità di sicurezza come rate limiting, protezione contro attacchi comuni tramite Helmet, e logging avanzato con Pino.

L'applicazione è strutturata seguendo i principi di architettura modulare di NestJS, offrendo un codice facilmente manutenibile e scalabile per applicazioni enterprise.

## Caratteristiche principali

- **Formato di risposta uniforme**: Tutte le API restituiscono lo stesso formato di risposta, facilitando l'utilizzo da parte dei client.
- **Intercettazione degli errori centralizzata**: Tutti gli errori vengono gestiti uniformemente, con log dettagliati e risposte formattate.
- **Logging delle performance**: Ogni richiesta API viene loggata con il suo tempo di esecuzione, permettendo di identificare facilmente i problemi di performance.
- **Supporto per il tracciamento**: Le richieste HTTP includono un ID univoco per facilitare il debug e il tracciamento attraverso l'intera applicazione.
- **Metadati consistenti**: Ogni risposta include informazioni come timestamp, percorso della richiesta e codice di stato.
- **Separazione delle responsabilità**: La logica di business nei controller è separata dalla formattazione delle risposte, che avviene automaticamente.

## Moduli implementati

- **Autenticazione**: Sistema completo con JWT, login, e controllo dei ruoli.
- **Gestione utenti**: CRUD completo per gli utenti con validazione e hashing delle password.
- **Health check**: Endpoint per monitorare lo stato dell'applicazione e la connessione al database.
- **Database**: Integrazione con MongoDB tramite Mongoose con gestione ottimizzata delle connessioni.

## Tecnologie utilizzate

- **NestJS**: Framework per la costruzione di applicazioni server-side efficienti e scalabili.
- **MongoDB**: Database NoSQL per la gestione dei dati.
- **JWT**: Per l'autenticazione sicura.
- **Mongoose**: ODM per MongoDB.
- **Pino**: Logger performante.
- **Throttler**: Protezione contro attacchi di tipo brute force.
- **Helmet**: Sicurezza HTTP.
- **Class-validator**: Validazione dei dati in entrata.

## Requisiti

- Node.js (versione consigliata: >=18.x)
- MongoDB

## Installazione

```bash
npm install
```

## Esecuzione

```bash
# Sviluppo
npm run start:dev

# Produzione
npm run build
npm run start:prod
```

## Test

```bash
# Unit test
npm run test

# Test e2e
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment su Vercel

Questo progetto è configurato per essere facilmente deployato su Vercel. Assicurarsi di configurare correttamente le variabili d'ambiente necessarie nella dashboard di Vercel.


## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
