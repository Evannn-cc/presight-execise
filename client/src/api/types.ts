// The API contract types are shared with the server (type-only imports, erased
// at build time) so client and server can't silently drift apart.
import type { FacetEntry, SortDir, SortField } from '../../../server/src/types';

export type {
  UserDTO as User,
  PaginationMeta,
  PaginatedUsers,
  FacetEntry,
  SortField,
  SortDir,
} from '../../../server/src/types';
export { SORT_FIELDS, SORT_DIRS } from '../../../server/src/types';

export interface FacetResponse {
  data: FacetEntry[];
}

/** Client view state: the server-side filters plus the active sort. */
export interface Filters {
  search: string;
  hobbies: string[];
  nationalities: string[];
  sortBy: SortField;
  sortDir: SortDir;
}
