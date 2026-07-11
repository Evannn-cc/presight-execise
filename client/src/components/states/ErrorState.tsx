interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Request failed
      </div>
      <h2 className="font-display text-lg font-bold text-ink">Couldn't load the directory</h2>
      <p className="max-w-sm text-sm text-muted">
        {message ?? 'The server did not respond.'} The list will reload when you try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-[3px] bg-cobalt px-4 py-2 text-sm font-medium text-white hover:bg-cobalt/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
      >
        Try again
      </button>
    </div>
  );
}
