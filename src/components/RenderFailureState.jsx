import FileUploader from './FileUploader';

/**
 * Shown when the Markdown renderer itself throws on pathological input.
 * The document can't be recovered, but the app stays usable — the user can
 * immediately load a different file without a full page reload.
 */
export default function RenderFailureState({ onFileLoaded, onError }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
      <p className="text-base font-medium text-red-900">This file couldn&apos;t be rendered</p>
      <p className="mt-1 text-sm text-red-700">The Markdown may be too malformed to display. Try a different file.</p>
      <div className="mt-6 inline-block">
        <FileUploader compact onFileLoaded={onFileLoaded} onError={onError} />
      </div>
    </div>
  );
}
