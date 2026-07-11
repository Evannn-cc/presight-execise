import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Database } from 'better-sqlite3';
import type { Express } from 'express';
import { createApp } from '../app';
import { makeTestDb, FIXTURE_USERS } from './fixture';

let db: Database;
let app: Express;

beforeAll(() => {
  db = makeTestDb();
  app = createApp(db);
});

afterAll(() => {
  db.close();
});

const ids = (res: request.Response): number[] => res.body.data.map((u: { id: number }) => u.id);

describe('GET /api/users', () => {
  it('returns the envelope with default sort (first_name asc, id tie-break)', async () => {
    const res = await request(app).get('/api/users').expect(200);
    expect(res.body.pagination).toEqual({
      offset: 0,
      limit: 30,
      total: FIXTURE_USERS.length,
      hasMore: false,
    });
    // Alphabetical by first_name; the three "Alex" users tie-break by ascending id.
    expect(ids(res)).toEqual([1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 8, 11]);
    const first = res.body.data[0];
    expect(first).toMatchObject({
      id: 1,
      first_name: 'Alex',
      last_name: 'Smith',
      age: 30,
      nationality: 'American',
      hobbies: ['Chess', 'Hiking'],
    });
    expect(typeof first.avatar).toBe('string');
  });

  it('pages through all users with limit=5 without duplicates or gaps', async () => {
    const seen: number[] = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const res = await request(app).get(`/api/users?limit=5&offset=${offset}`).expect(200);
      seen.push(...ids(res));
      hasMore = res.body.pagination.hasMore;
      offset += 5;
    }
    expect(seen).toHaveLength(FIXTURE_USERS.length);
    expect(new Set(seen).size).toBe(FIXTURE_USERS.length);
  });

  it('reports hasMore correctly at boundaries', async () => {
    const first = await request(app).get('/api/users?limit=5').expect(200);
    expect(first.body.pagination.hasMore).toBe(true);

    const last = await request(app).get('/api/users?limit=5&offset=10').expect(200);
    expect(last.body.data).toHaveLength(2);
    expect(last.body.pagination.hasMore).toBe(false);

    const past = await request(app).get('/api/users?limit=5&offset=100').expect(200);
    expect(past.body.data).toEqual([]);
    expect(past.body.pagination.hasMore).toBe(false);
  });

  it('text search matches first_name or last_name, case-insensitively', async () => {
    const res = await request(app).get('/api/users?search=ANN').expect(200);
    // Ann, Anna, Annabelle (first names) + Mann, Ann (last names)
    expect(ids(res).sort((a, b) => a - b)).toEqual([4, 5, 6, 7, 11]);
  });

  it('escapes LIKE wildcards in search input', async () => {
    const percent = await request(app).get('/api/users?search=%25').expect(200); // "%25" = "%"
    expect(ids(percent)).toEqual([8]); // only Per%cy, not everyone

    const underscore = await request(app).get('/api/users?search=r_c').expect(200); // "_" literal
    expect(ids(underscore)).toEqual([]);
  });

  it('applies OR semantics for multiple nationalities', async () => {
    const res = await request(app)
      .get('/api/users?nationality=German&nationality=Chinese')
      .expect(200);
    expect(ids(res).sort((a, b) => a - b)).toEqual([4, 7, 11]);
  });

  it('applies AND semantics for multiple hobbies', async () => {
    const both = await request(app).get('/api/users?hobby=Chess&hobby=Hiking').expect(200);
    expect(ids(both).sort((a, b) => a - b)).toEqual([1, 4, 9]);

    const single = await request(app).get('/api/users?hobby=Chess').expect(200);
    expect(ids(single).sort((a, b) => a - b)).toEqual([1, 2, 4, 8, 9, 11]);
  });

  it('deduplicates repeated filter values instead of making them unsatisfiable', async () => {
    const res = await request(app).get('/api/users?hobby=Chess&hobby=Chess').expect(200);
    expect(ids(res).sort((a, b) => a - b)).toEqual([1, 2, 4, 8, 9, 11]);
  });

  it('combines text, nationality, and hobby filters', async () => {
    const res = await request(app)
      .get('/api/users?search=ann&nationality=Chinese&hobby=Chess&hobby=Hiking')
      .expect(200);
    expect(ids(res)).toEqual([4]);
    expect(res.body.pagination.total).toBe(1);
  });

  it('sorts by age desc with ascending-id tie-break', async () => {
    const res = await request(app).get('/api/users?sortBy=age&sortDir=desc').expect(200);
    // The three age-30 users (ids 1, 3, 12) stay in ascending id order.
    expect(ids(res)).toEqual([8, 7, 9, 4, 5, 11, 1, 3, 12, 6, 2, 10]);
  });

  it('sorts by last_name asc', async () => {
    const res = await request(app).get('/api/users?sortBy=last_name').expect(200);
    expect(ids(res)).toEqual([11, 3, 6, 2, 5, 4, 7, 10, 1, 9, 12, 8]);
  });

  it('sorts by nationality asc with id tie-break within each nationality', async () => {
    const res = await request(app).get('/api/users?sortBy=nationality').expect(200);
    expect(ids(res)).toEqual([1, 3, 9, 12, 2, 6, 4, 8, 7, 11, 5, 10]);
  });

  it('pagination respects the active sort without duplicates or gaps', async () => {
    const seen: number[] = [];
    for (let offset = 0; offset < FIXTURE_USERS.length; offset += 4) {
      const res = await request(app)
        .get(`/api/users?sortBy=age&sortDir=desc&limit=4&offset=${offset}`)
        .expect(200);
      seen.push(...ids(res));
    }
    expect(seen).toEqual([8, 7, 9, 4, 5, 11, 1, 3, 12, 6, 2, 10]);
  });

  it('returns hobbies as an empty array for users without hobbies', async () => {
    const res = await request(app).get('/api/users?search=Underwood').expect(200);
    expect(res.body.data[0].hobbies).toEqual([]);
  });

  it('rejects invalid parameters with 400', async () => {
    await request(app).get('/api/users?sortBy=avatar').expect(400);
    await request(app).get('/api/users?sortDir=sideways').expect(400);
    await request(app).get('/api/users?limit=0').expect(400);
    await request(app).get('/api/users?limit=1000').expect(400);
    await request(app).get('/api/users?offset=-1').expect(400);
    await request(app).get('/api/users?offset=abc').expect(400);
    // beyond Number.MAX_SAFE_INTEGER: must be a 400, not a SQLite datatype error
    await request(app).get('/api/users?offset=99999999999999999999999').expect(400);
  });
});
