import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildFilterParams } from '../api/client';
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
  const params = buildFilterParams(filters);
  // Defaults are omitted so clean URLs stay clean.
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
  /** Increments on clearAll so inputs holding un-committed (debounced) drafts can reset. */
  clearSignal: number;
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
  const [clearSignal, setClearSignal] = useState(0);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  // All mutations derive the next state from `prev` inside the functional
  // updater, so rapid consecutive updates never read stale params.
  const update = useCallback(
    (mutate: (current: Filters) => Partial<Filters>, options?: { replace?: boolean }) => {
      setSearchParams((prev) => {
        const current = parseFilters(prev);
        return serializeFilters({ ...current, ...mutate(current) });
      }, options);
    },
    [setSearchParams],
  );

  return {
    filters,
    clearSignal,
    hasActiveFilters:
      filters.search !== '' || filters.hobbies.length > 0 || filters.nationalities.length > 0,
    // replace: true so every debounced keystroke doesn't pollute history
    setSearch: useCallback((search) => update(() => ({ search }), { replace: true }), [update]),
    toggleHobby: useCallback(
      (hobby) => update((current) => ({ hobbies: toggle(current.hobbies, hobby) })),
      [update],
    ),
    toggleNationality: useCallback(
      (nationality) =>
        update((current) => ({ nationalities: toggle(current.nationalities, nationality) })),
      [update],
    ),
    setSort: useCallback((sortBy, sortDir) => update(() => ({ sortBy, sortDir })), [update]),
    clearAll: useCallback(() => {
      // Signal even when the committed search is already empty, so a pending
      // debounced keystroke can't resurrect a filter the user just cleared.
      setClearSignal((n) => n + 1);
      update(() => ({ search: '', hobbies: [], nationalities: [] }));
    }, [update]),
  };
}
