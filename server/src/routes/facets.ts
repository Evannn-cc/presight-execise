import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { topHobbies, topNationalities } from '../db/repository';
import { parseFilters } from '../lib/parseQuery';

export function hobbiesRouter(db: Database): Router {
  const router = Router();

  router.get('/top', (req, res) => {
    res.json({ data: topHobbies(db, parseFilters(req.query)) });
  });

  return router;
}

export function nationalitiesRouter(db: Database): Router {
  const router = Router();

  router.get('/top', (req, res) => {
    res.json({ data: topNationalities(db, parseFilters(req.query)) });
  });

  return router;
}
