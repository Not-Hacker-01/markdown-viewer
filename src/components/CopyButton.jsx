import { useCallback, useEffect, useRef, useState } from 'react';
import { copyRenderedMarkdown } from '../utils/clipboard';
import { COPY_FEEDBACK_DURATION_MS } from '../utils/constants';

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Single primary copy action: writes the rendered HTML, plain text, and
 * original Markdown to the clipboard in one payload (see utils/clipboard),
 * and reports truthful success/failure — never claims "Copied" on failure.
 */
export default function CopyButton({ containerRef, markdownSource }) {
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = useCallback(async () => {
    if (status === 'copying') return;
    setStatus('copying');
    const result = await copyRenderedMarkdown({
      containerEl: containerRef.current,
      markdownSource,
    });
    setStatus(result.success ? 'success' : 'error');
    setFeedback(result.message);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus('idle'), COPY_FEEDBACK_DURATION_MS);
  }, [containerRef, markdownSource, status]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        disabled={status === 'copying'}
        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <CopyIcon />
        {status === 'copying' ? 'Copying…' : 'Copy'}
      </button>
      <span role="status" className={`text-sm font-medium ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
        {status === 'success' || status === 'error' ? feedback : ''}
      </span>
    </div>
  );
}
