export interface UserDTO {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface PaginationMeta {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedUsers {
  data: UserDTO[];
  pagination: PaginationMeta;
}

export interface FacetEntry {
  value: string;
  count: number;
}

export const SORT_FIELDS = ['first_name', 'last_name', 'age', 'nationality'] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_DIRS = ['asc', 'desc'] as const;
export type SortDir = (typeof SORT_DIRS)[number];

export interface Filters {
  search: string;
  nationalities: string[];
  hobbies: string[];
}

export interface UserQuery extends Filters {
  sortBy: SortField;
  sortDir: SortDir;
  offset: number;
  limit: number;
}
