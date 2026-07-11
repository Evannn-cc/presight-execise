import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Database } from 'better-sqlite3';
import type { Express } from 'express';
import { createApp } from '../app';
import { makeTestDb } from './fixture';

let db: Database;
let app: Express;

beforeAll(() => {
  db = makeTestDb();
  app = createApp(db);
});

afterAll(() => {
  db.close();
});

describe('GET /api/hobbies/top', () => {
  it('returns global counts ordered by count desc, then value asc', async () => {
    const res = await request(app).get('/api/hobbies/top').expect(200);
    expect(res.body.data).toEqual([
      { value: 'Chess', count: 6 },
      { value: 'Hiking', count: 5 },
      { value: 'Reading', count: 4 },
      { value: 'Cooking', count: 3 },
      // count ties resolve alphabetically
      { value: 'Fishing', count: 1 },
      { value: 'Gaming', count: 1 },
      { value: 'Painting', count: 1 },
      { value: 'Running', count: 1 },
      { value: 'Swimming', count: 1 },
      { value: 'Yoga', count: 1 },
    ]);
  });

  it('respects the text filter', async () => {
    const res = await request(app).get('/api/hobbies/top?search=ann').expect(200);
    // Matching users: Ann, Anna, Annabelle, Mann, (Zoe) Ann
    expect(res.body.data).toEqual([
      { value: 'Chess', count: 2 },
      { value: 'Cooking', count: 2 },
      { value: 'Reading', count: 2 },
      { value: 'Hiking', count: 1 },
    ]);
  });

  it('respects the nationality filter (cross-facet)', async () => {
    const res = await request(app).get('/api/hobbies/top?nationality=American').expect(200);
    expect(res.body.data).toEqual([
      { value: 'Hiking', count: 3 },
      { value: 'Chess', count: 2 },
      { value: 'Cooking', count: 1 },
      { value: 'Fishing', count: 1 },
      { value: 'Gaming', count: 1 },
      { value: 'Painting', count: 1 },
      { value: 'Reading', count: 1 },
      { value: 'Running', count: 1 },
      { value: 'Swimming', count: 1 },
      { value: 'Yoga', count: 1 },
    ]);
  });

  it('includes the selected hobby itself: counts are co-occurrence within the filtered set', async () => {
    const res = await request(app).get('/api/hobbies/top?hobby=Chess').expect(200);
    // Chess-havers: ids 1, 2, 4, 8, 9, 11 — Chess's own count equals the filtered total.
    expect(res.body.data).toEqual([
      { value: 'Chess', count: 6 },
      { value: 'Hiking', count: 3 },
      { value: 'Cooking', count: 2 },
      { value: 'Reading', count: 2 },
      { value: 'Fishing', count: 1 },
      { value: 'Gaming', count: 1 },
      { value: 'Painting', count: 1 },
      { value: 'Running', count: 1 },
      { value: 'Swimming', count: 1 },
      { value: 'Yoga', count: 1 },
    ]);
  });

  it('returns an empty list when no users match', async () => {
    const res = await request(app).get('/api/hobbies/top?search=zzzzzz').expect(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/nationalities/top', () => {
  it('returns global counts ordered by count desc, then value asc', async () => {
    const res = await request(app).get('/api/nationalities/top').expect(200);
    expect(res.body.data).toEqual([
      { value: 'American', count: 4 },
      { value: 'British', count: 2 },
      { value: 'German', count: 2 },
      { value: 'Chinese', count: 1 },
      { value: 'French', count: 1 },
      { value: 'Korean', count: 1 },
      { value: 'Vietnamese', count: 1 },
    ]);
  });

  it('respects the text filter', async () => {
    const res = await request(app).get('/api/nationalities/top?search=ann').expect(200);
    expect(res.body.data).toEqual([
      { value: 'German', count: 2 },
      { value: 'British', count: 1 },
      { value: 'Chinese', count: 1 },
      { value: 'Korean', count: 1 },
    ]);
  });

  it('respects the hobby filter (cross-facet)', async () => {
    const res = await request(app).get('/api/nationalities/top?hobby=Cooking').expect(200);
    expect(res.body.data).toEqual([
      { value: 'German', count: 2 },
      { value: 'American', count: 1 },
    ]);
  });

  it('excludes its own selection (OR semantics): other nationalities stay discoverable', async () => {
    const res = await request(app).get('/api/nationalities/top?nationality=German').expect(200);
    // The nationality clause is dropped for this facet, so all values remain
    // clickable for building a multi-nationality OR filter.
    expect(res.body.data).toEqual([
      { value: 'American', count: 4 },
      { value: 'British', count: 2 },
      { value: 'German', count: 2 },
      { value: 'Chinese', count: 1 },
      { value: 'French', count: 1 },
      { value: 'Korean', count: 1 },
      { value: 'Vietnamese', count: 1 },
    ]);
  });

  it('still applies the other filters when its own selection is excluded', async () => {
    const res = await request(app)
      .get('/api/nationalities/top?nationality=German&hobby=Cooking')
      .expect(200);
    // Only the hobby filter applies: Cooking users are ids 7, 9, 11.
    expect(res.body.data).toEqual([
      { value: 'German', count: 2 },
      { value: 'American', count: 1 },
    ]);
  });

  it('returns an empty list when no users match', async () => {
    const res = await request(app).get('/api/nationalities/top?search=zzzzzz').expect(200);
    expect(res.body.data).toEqual([]);
  });
});
