import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SORT_DIRS, SORT_FIELDS, type Filters, type SortDir, type SortField } from '../api/types';

export const DEFAULT_SORT_BY: SortField = 'first_name';
export const DEFAULT_SORT_DIR: SortDir = 'asc';

function parseFilters(params: URLSearchParams): Filters {
  const sortBy = params.get('sortBy') as SortField | null;
  const sortDir = params.get('sortDir') as SortDir | null;
  return {
    search: params.get('search') ?? '',
    hobbies: params.getAll('hobby'),
    nationalities: params.getAll('nationality'),
    sortBy: sortBy && SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_SORT_BY,
    sortDir: sortDir && SORT_DIRS.includes(sortDir) ? sortDir : DEFAULT_SORT_DIR,
  };
}

function serializeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  for (const hobby of filters.hobbies) params.append('hobby', hobby);
  for (const nationality of filters.nationalities) params.append('nationality', nationality);
  if (filters.sortBy !== DEFAULT_SORT_BY) params.set('sortBy', filters.sortBy);
  if (filters.sortDir !== DEFAULT_SORT_DIR) params.set('sortDir', filters.sortDir);
  return params;
}

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export interface UrlFilters {
  filters: Filters;
  hasActiveFilters: boolean;
  setSearch: (search: string) => void;
  toggleHobby: (hobby: string) => void;
  toggleNationality: (nationality: string) => void;
  setSort: (sortBy: SortField, sortDir: SortDir) => void;
  clearAll: () => void;
}

/**
 * The URL query string is the single source of truth for all view state,
 * so reloading or sharing a URL restores the same view.
 */
export function useUrlFilters(): UrlFilters {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const update = useCallback(
    (partial: Partial<Filters>, options?: { replace?: boolean }) => {
      setSearchParams((prev) => serializeFilters({ ...parseFilters(prev), ...partial }), options);
    },
    [setSearchParams],
  );

  return {
    filters,
    hasActiveFilters:
      filters.search !== '' || filters.hobbies.length > 0 || filters.nationalities.length > 0,
    // replace: true so every debounced keystroke doesn't pollute history
    setSearch: useCallback((search) => update({ search }, { replace: true }), [update]),
    toggleHobby: useCallback(
      (hobby) => update({ hobbies: toggle(parseFilters(searchParams).hobbies, hobby) }),
      [update, searchParams],
    ),
    toggleNationality: useCallback(
      (nationality) =>
        update({ nationalities: toggle(parseFilters(searchParams).nationalities, nationality) }),
      [update, searchParams],
    ),
    setSort: useCallback((sortBy, sortDir) => update({ sortBy, sortDir }), [update]),
    clearAll: useCallback(() => update({ search: '', hobbies: [], nationalities: [] }), [update]),
  };
}
