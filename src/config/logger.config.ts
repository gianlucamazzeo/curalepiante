import { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { singleLine: true } }
        : undefined,
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
      remove: true,
    },
    customProps: () => ({
      context: 'HTTP',
    }),
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    },
    serializers: {
      req: (
        req: import('http').IncomingMessage & {
          id?: string;
          query?: any;
          params?: any;
        },
      ) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query as Record<string, any>,
        params: req.params as Record<string, any>,
        headers: req.headers,
      }),
      res: (res: import('http').ServerResponse) => ({
        statusCode: res.statusCode,
      }),
      err: (err: Error & { type?: string }) => ({
        type: err.type,
        message: err.message,
        stack: err.stack,
      }),
    },
  },
};
