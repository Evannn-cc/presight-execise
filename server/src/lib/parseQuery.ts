import { SORT_DIRS, SORT_FIELDS, type Filters, type UserQuery } from '../types';

export class BadRequestError extends Error {}

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

type RawQuery = Record<string, unknown>;

function toStringArray(value: unknown): string[] {
  if (value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  const parsed = values.map((v) => {
    if (typeof v !== 'string' || v.length === 0) {
      throw new BadRequestError('Filter values must be non-empty strings');
    }
    return v;
  });
  // Dedupe: the hobbies-AND query compares COUNT(DISTINCT ...) with the
  // selection size, so a duplicated value would make the filter unsatisfiable.
  return [...new Set(parsed)];
}

function toInt(value: unknown, name: string, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
  if (!Number.isSafeInteger(parsed)) {
    throw new BadRequestError(`"${name}" must be a non-negative integer`);
  }
  return parsed;
}

export function parseFilters(raw: RawQuery): Filters {
  const search = raw.search === undefined ? '' : raw.search;
  if (typeof search !== 'string') {
    throw new BadRequestError('"search" must be a single string');
  }
  return {
    search: search.trim(),
    nationalities: toStringArray(raw.nationality),
    hobbies: toStringArray(raw.hobby),
  };
}

export function parseUserQuery(raw: RawQuery): UserQuery {
  const filters = parseFilters(raw);

  const sortBy = raw.sortBy ?? 'first_name';
  if (typeof sortBy !== 'string' || !(SORT_FIELDS as readonly string[]).includes(sortBy)) {
    throw new BadRequestError(`"sortBy" must be one of: ${SORT_FIELDS.join(', ')}`);
  }

  const sortDir = raw.sortDir ?? 'asc';
  if (typeof sortDir !== 'string' || !(SORT_DIRS as readonly string[]).includes(sortDir)) {
    throw new BadRequestError('"sortDir" must be "asc" or "desc"');
  }

  const offset = toInt(raw.offset, 'offset', 0);
  const limit = toInt(raw.limit, 'limit', DEFAULT_LIMIT);
  if (limit < 1 || limit > MAX_LIMIT) {
    throw new BadRequestError(`"limit" must be between 1 and ${MAX_LIMIT}`);
  }

  return {
    ...filters,
    sortBy: sortBy as UserQuery['sortBy'],
    sortDir: sortDir as UserQuery['sortDir'],
    offset,
    limit,
  };
}
