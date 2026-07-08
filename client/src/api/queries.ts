import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { buildFilterParams, fetchJson } from './client';
import type { FacetResponse, Filters, PaginatedUsers } from './types';

export const PAGE_SIZE = 30;

export function useUsersInfinite(filters: Filters) {
  return useInfiniteQuery({
    queryKey: ['users', filters],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => {
      const params = buildFilterParams(filters);
      params.set('sortBy', filters.sortBy);
      params.set('sortDir', filters.sortDir);
      params.set('offset', String(pageParam));
      params.set('limit', String(PAGE_SIZE));
      return fetchJson<PaginatedUsers>(`/api/users?${params}`, signal);
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    placeholderData: keepPreviousData,
  });
}

function useFacet(endpoint: string, key: string, filters: Filters) {
  return useQuery({
    // Facets ignore sort, so key only on the filter values that affect them.
    queryKey: [key, filters.search, filters.hobbies, filters.nationalities],
    queryFn: ({ signal }) =>
      fetchJson<FacetResponse>(`${endpoint}?${buildFilterParams(filters)}`, signal),
    placeholderData: keepPreviousData,
  });
}

export function useTopHobbies(filters: Filters) {
  return useFacet('/api/hobbies/top', 'hobbies-top', filters);
}

export function useTopNationalities(filters: Filters) {
  return useFacet('/api/nationalities/top', 'nationalities-top', filters);
}
