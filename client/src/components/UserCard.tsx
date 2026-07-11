import type { User } from '../api/types';
import Avatar from './Avatar';
import HobbyChips from './HobbyChips';

export default function UserCard({ user }: { user: User }) {
  return (
    <article className="rounded-[3px] border border-line bg-white p-4 shadow-[0_1px_0_rgba(28,35,51,0.06)]">
      <div className="flex gap-4">
        <Avatar src={user.avatar} firstName={user.first_name} lastName={user.last_name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[17px] font-semibold leading-6 text-ink">
            {user.first_name} {user.last_name}
          </h3>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-cobalt">
              {user.nationality}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted">
              <span className="tracking-[0.08em]">AGE</span>{' '}
              <span className="font-medium text-ink">{user.age}</span>
            </span>
          </div>
          <div className="mt-2.5">
            <HobbyChips hobbies={user.hobbies} />
          </div>
        </div>
      </div>
    </article>
  );
}
