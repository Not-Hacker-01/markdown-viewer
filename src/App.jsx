import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import EmptyState from './components/EmptyState';
import FileUploader from './components/FileUploader';
import CopyButton from './components/CopyButton';
import ErrorState from './components/ErrorState';
import RenderErrorBoundary from './components/RenderErrorBoundary';
import RenderFailureState from './components/RenderFailureState';

// Code-split: react-markdown + rehype-highlight's language grammars are
// the bulk of the JS bundle but are only needed once a file is loaded.
const MarkdownViewer = lazy(() => import('./components/MarkdownViewer'));

export default function App() {
  const [doc, setDoc] = useState(null); // { fileName, source } | null
  const [fileError, setFileError] = useState(null);
  const containerRef = useRef(null);

  const handleFileLoaded = useCallback((source, fileName) => {
    setFileError(null);
    setDoc({ source, fileName });
  }, []);

  const handleFileError = useCallback((message) => {
    setFileError(message);
  }, []);

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Markdown Viewer</p>
            {doc && <p className="truncate text-xs text-slate-500">{doc.fileName}</p>}
          </div>
          {doc && (
            <div className="flex shrink-0 items-center gap-3">
              <CopyButton containerRef={containerRef} markdownSource={doc.source} />
              <FileUploader compact onFileLoaded={handleFileLoaded} onError={handleFileError} />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {fileError && (
          <div className="mb-6">
            <ErrorState title="Couldn't load file" message={fileError} onDismiss={() => setFileError(null)} />
          </div>
        )}

        {!doc ? (
          <EmptyState onFileLoaded={handleFileLoaded} onError={handleFileError} />
        ) : (
          <RenderErrorBoundary
            key={`${doc.fileName}-${doc.source.length}`}
            fallback={<RenderFailureState onFileLoaded={handleFileLoaded} onError={handleFileError} />}
          >
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
              <Suspense fallback={<div className="py-16 text-center text-sm text-slate-400">Loading…</div>}>
                <MarkdownViewer source={doc.source} containerRef={containerRef} />
              </Suspense>
            </div>
          </RenderErrorBoundary>
        )}
      </main>
    </div>
  );
}
