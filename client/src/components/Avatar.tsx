import { useState } from 'react';

interface AvatarProps {
  src: string;
  firstName: string;
  lastName: string;
}

export default function Avatar({ src, firstName, lastName }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  if (failed) {
    return (
      <div
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${firstName} ${lastName}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-12 shrink-0 rounded-full bg-slate-100 object-cover"
    />
  );
}
