import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import type { Database } from 'better-sqlite3';
import { usersRouter } from './routes/users';
import { hobbiesRouter, nationalitiesRouter } from './routes/facets';
import { BadRequestError } from './lib/parseQuery';

export interface AppOptions {
  /** Directory of built client assets to serve in production. */
  staticDir?: string;
}

export function createApp(db: Database, options: AppOptions = {}): Express {
  const app = express();

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/users', usersRouter(db));
  app.use('/api/hobbies', hobbiesRouter(db));
  app.use('/api/nationalities', nationalitiesRouter(db));

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  if (options.staticDir && fs.existsSync(options.staticDir)) {
    const indexHtml = path.join(options.staticDir, 'index.html');
    app.use(express.static(options.staticDir));
    // SPA fallback (Express 5 wildcard syntax).
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(indexHtml);
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof BadRequestError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
