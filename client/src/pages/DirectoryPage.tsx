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
    clearSignal,
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
    <div className="flex h-dvh flex-col bg-paper font-sans text-ink">
      {/* passport-cover rule */}
      <div className="h-1 shrink-0 bg-cobalt" aria-hidden />
      <header className="z-10 border-b-2 border-ink/80 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="font-display text-xl font-bold uppercase tracking-[0.04em]">
              User Directory
            </h1>
            {total !== undefined && (
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                {total.toLocaleString()} {total === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="relative shrink-0 rounded-[3px] border border-ink/25 bg-white p-2 text-ink/70 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt lg:hidden"
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
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-cobalt font-mono text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <SearchInput value={filters.search} clearSignal={clearSignal} onChange={setSearch} />
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

      <div className="mx-auto flex w-full max-w-5xl flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 space-y-6 overflow-y-auto border-r border-line bg-white px-4 py-4 lg:block">
          {sidebar}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-20 lg:hidden" role="dialog" aria-label="Filters">
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col overflow-y-auto bg-white px-4 py-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display font-bold uppercase tracking-[0.08em] text-ink">
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close filters"
                  className="rounded-[3px] p-1.5 text-muted hover:bg-paper"
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
