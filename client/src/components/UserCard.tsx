import type { User } from '../api/types';
import Avatar from './Avatar';
import HobbyChips from './HobbyChips';

export default function UserCard({ user }: { user: User }) {
  return (
    <article className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Avatar src={user.avatar} firstName={user.first_name} lastName={user.last_name} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">
          {user.first_name} {user.last_name}
        </h3>
        <div className="mt-0.5 flex items-baseline justify-between gap-2 text-sm text-slate-500">
          <span className="truncate">{user.nationality}</span>
          <span className="shrink-0">{user.age}</span>
        </div>
        <div className="mt-2">
          <HobbyChips hobbies={user.hobbies} />
        </div>
      </div>
    </article>
  );
}
