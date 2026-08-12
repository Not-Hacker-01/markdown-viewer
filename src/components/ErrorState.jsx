function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500">
      <path
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Dismissible inline banner for file-load errors; never replaces already-rendered content. */
export default function ErrorState({ title, message, onDismiss }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <WarningIcon />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">{title}</p>
        {message && <p className="mt-0.5 text-sm text-amber-700">{message}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="rounded p-0.5 text-amber-500 hover:text-amber-700"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
