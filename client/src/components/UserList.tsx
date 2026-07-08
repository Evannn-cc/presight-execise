import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { User } from '../api/types';
import UserCard from './UserCard';

interface UserListProps {
  users: User[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  /** Changes whenever the filter/sort state changes; scrolls back to the top. */
  resetKey: string;
  dimmed: boolean;
}

const FETCH_AHEAD_ROWS = 5;

export default function UserList({
  users,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  resetKey,
  dimmed,
}: UserListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = users.length + (hasNextPage ? 1 : 0);
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 110,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const lastVisible = virtualItems.at(-1);
    if (!lastVisible) return;
    if (
      lastVisible.index >= users.length - FETCH_AHEAD_ROWS &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualItems, users.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    virtualizer.scrollToOffset(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <div
      ref={parentRef}
      className={`h-full overflow-y-auto px-4 py-4 transition-opacity ${dimmed ? 'opacity-60' : ''}`}
    >
      <div style={{ height: virtualizer.getTotalSize() }} className="relative">
        {virtualItems.map((item) => {
          const isLoaderRow = item.index >= users.length;
          return (
            <div
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              <div className="pb-3">
                {isLoaderRow ? (
                  <div className="flex justify-center py-4" aria-label="Loading more users">
                    <div className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                  </div>
                ) : (
                  <UserCard user={users[item.index]} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
