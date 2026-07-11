import { useState } from 'react';

interface AvatarProps {
  src: string;
  firstName: string;
  lastName: string;
}

// Square, framed like an ID photo. The initials render underneath and the
// photo covers them when it loads, so the frame is never blank — while the
// image is loading, and if it never arrives.
export default function Avatar({ src, firstName, lastName }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  return (
    <div
      aria-hidden
      className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-line bg-paper font-mono text-sm font-medium text-ink/60"
    >
      {initials}
      {!failed && (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}
