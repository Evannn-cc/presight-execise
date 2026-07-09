import { useState } from 'react';
import { useUsersInfinite, useTopHobbies, useTopNationalities } from '../api/queries';
import { useUrlFilters } from '../hooks/useUrlFilters';
import SearchInput from '../components/SearchInput';
import SortControls from '../components/SortControls';
import ActiveFilterChips from '../components/ActiveFilterChips';
import Sidebar from '../components/Sidebar';
import UserList from '../components/UserList';
import ListSkeleton from '../components/states/ListSkeleton';
import EmptyState from '../components/states/EmptyState';
import ErrorState from '../components/states/ErrorState';

export default function DirectoryPage() {
  const {
    filters,
    hasActiveFilters,
    setSearch,
    toggleHobby,
    toggleNationality,
    setSort,
    clearAll,
  } = useUrlFilters();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const usersQuery = useUsersInfinite(filters);
  const hobbiesQuery = useTopHobbies(filters);
  const nationalitiesQuery = useTopNationalities(filters);

  const users = usersQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = usersQuery.data?.pages[0]?.pagination.total;
  const activeFilterCount = filters.hobbies.length + filters.nationalities.length;

  const sidebar = (
    <Sidebar
      hobbiesQuery={hobbiesQuery}
      nationalitiesQuery={nationalitiesQuery}
      selectedHobbies={filters.hobbies}
      selectedNationalities={filters.nationalities}
      onToggleHobby={toggleHobby}
      onToggleNationality={toggleNationality}
    />
  );

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <header className="z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="text-lg font-bold text-slate-900">User Directory</h1>
            {total !== undefined && (
              <span className="text-sm text-slate-500">
                {total.toLocaleString()} {total === 1 ? 'user' : 'users'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="relative shrink-0 rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open filters"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10m-7 6h4" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <SearchInput value={filters.search} onChange={setSearch} />
            <SortControls sortBy={filters.sortBy} sortDir={filters.sortDir} onChange={setSort} />
          </div>
          <ActiveFilterChips
            hobbies={filters.hobbies}
            nationalities={filters.nationalities}
            onRemoveHobby={toggleHobby}
            onRemoveNationality={toggleNationality}
            onClearAll={clearAll}
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-4 py-4 lg:block">
          {sidebar}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-20 lg:hidden" role="dialog" aria-label="Filters">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col overflow-y-auto bg-white px-4 py-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close filters"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          {usersQuery.isPending ? (
            <ListSkeleton />
          ) : usersQuery.isError ? (
            <ErrorState
              message={usersQuery.error instanceof Error ? usersQuery.error.message : undefined}
              onRetry={() => usersQuery.refetch()}
            />
          ) : total === 0 ? (
            <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearAll} />
          ) : (
            <UserList
              users={users}
              hasNextPage={usersQuery.hasNextPage}
              isFetchingNextPage={usersQuery.isFetchingNextPage}
              fetchNextPage={() => usersQuery.fetchNextPage()}
              resetKey={JSON.stringify(filters)}
              dimmed={usersQuery.isPlaceholderData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
