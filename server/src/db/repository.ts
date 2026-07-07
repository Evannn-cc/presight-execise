import type { Database } from 'better-sqlite3';
import type { FacetEntry, Filters, PaginatedUsers, UserDTO, UserQuery } from '../types';
import { escapeLike, placeholders } from '../lib/sqlUtil';

// Sort input never reaches SQL directly: both maps act as whitelists.
const SORT_COLUMNS: Record<UserQuery['sortBy'], string> = {
  first_name: 'u.first_name COLLATE NOCASE',
  last_name: 'u.last_name COLLATE NOCASE',
  age: 'u.age',
  nationality: 'u.nationality COLLATE NOCASE',
};

const SORT_DIRECTIONS: Record<UserQuery['sortDir'], string> = {
  asc: 'ASC',
  desc: 'DESC',
};

interface BuiltFilter {
  where: string;
  params: unknown[];
}

// Shared by the list and both facet queries, so top-20 counts always reflect
// the active text filter and selected filters (per the exercise spec, the
// facet's own selection is included too — counts are drill-down previews).
function buildUserFilter(filters: Filters): BuiltFilter {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    clauses.push(
      `(u.first_name LIKE ? ESCAPE '\\' COLLATE NOCASE OR u.last_name LIKE ? ESCAPE '\\' COLLATE NOCASE)`,
    );
    const like = `%${escapeLike(filters.search)}%`;
    params.push(like, like);
  }

  if (filters.nationalities.length > 0) {
    clauses.push(`u.nationality IN (${placeholders(filters.nationalities.length)})`);
    params.push(...filters.nationalities);
  }

  if (filters.hobbies.length > 0) {
    // AND semantics: the user must have every selected hobby.
    clauses.push(`u.id IN (
      SELECT uh.user_id
      FROM user_hobbies uh
      JOIN hobbies h ON h.id = uh.hobby_id
      WHERE h.name IN (${placeholders(filters.hobbies.length)})
      GROUP BY uh.user_id
      HAVING COUNT(DISTINCT h.id) = ?
    )`);
    params.push(...filters.hobbies, filters.hobbies.length);
  }

  return {
    where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

type UserRow = Omit<UserDTO, 'hobbies'>;

function hobbiesByUserId(db: Database, userIds: number[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  if (userIds.length === 0) return map;

  const rows = db
    .prepare(
      `SELECT uh.user_id, h.name
       FROM user_hobbies uh
       JOIN hobbies h ON h.id = uh.hobby_id
       WHERE uh.user_id IN (${placeholders(userIds.length)})
       ORDER BY h.name`,
    )
    .all(...userIds) as { user_id: number; name: string }[];

  for (const row of rows) {
    const list = map.get(row.user_id);
    if (list) list.push(row.name);
    else map.set(row.user_id, [row.name]);
  }
  return map;
}

export function listUsers(db: Database, query: UserQuery): PaginatedUsers {
  const { where, params } = buildUserFilter(query);

  const orderBy = `ORDER BY ${SORT_COLUMNS[query.sortBy]} ${SORT_DIRECTIONS[query.sortDir]}, u.id ASC`;

  const rows = db
    .prepare(
      `SELECT u.id, u.avatar, u.first_name, u.last_name, u.age, u.nationality
       FROM users u
       ${where}
       ${orderBy}
       LIMIT ? OFFSET ?`,
    )
    .all(...params, query.limit, query.offset) as UserRow[];

  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM users u ${where}`).get(...params) as {
    total: number;
  };

  const hobbies = hobbiesByUserId(
    db,
    rows.map((row) => row.id),
  );

  return {
    data: rows.map((row) => ({ ...row, hobbies: hobbies.get(row.id) ?? [] })),
    pagination: {
      offset: query.offset,
      limit: query.limit,
      total,
      hasMore: query.offset + rows.length < total,
    },
  };
}

export function topHobbies(db: Database, filters: Filters): FacetEntry[] {
  const { where, params } = buildUserFilter(filters);

  return db
    .prepare(
      `SELECT h.name AS value, COUNT(*) AS count
       FROM user_hobbies uh
       JOIN hobbies h ON h.id = uh.hobby_id
       JOIN users u ON u.id = uh.user_id
       ${where}
       GROUP BY h.id
       ORDER BY count DESC, h.name ASC
       LIMIT 20`,
    )
    .all(...params) as FacetEntry[];
}

export function topNationalities(db: Database, filters: Filters): FacetEntry[] {
  const { where, params } = buildUserFilter(filters);

  return db
    .prepare(
      `SELECT u.nationality AS value, COUNT(*) AS count
       FROM users u
       ${where}
       GROUP BY u.nationality
       ORDER BY count DESC, u.nationality ASC
       LIMIT 20`,
    )
    .all(...params) as FacetEntry[];
}
