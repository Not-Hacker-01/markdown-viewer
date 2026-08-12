import FileUploader from './FileUploader';

/** Initial (no file loaded) view: brief intro plus the upload control. */
export default function EmptyState({ onFileLoaded, onError }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Markdown Viewer</h1>
      <p className="mt-2 text-base text-slate-500">
        Upload a Markdown file to render it as a clean, readable document.
      </p>
      <div className="mt-8 w-full">
        <FileUploader onFileLoaded={onFileLoaded} onError={onError} />
      </div>
    </div>
  );
}
