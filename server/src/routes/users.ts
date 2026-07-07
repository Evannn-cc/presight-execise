import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { listUsers } from '../db/repository';
import { parseUserQuery } from '../lib/parseQuery';

export function usersRouter(db: Database): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const query = parseUserQuery(req.query);
    res.json(listUsers(db, query));
  });

  return router;
}
