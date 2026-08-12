import { useCallback, useId, useState } from 'react';
import { readMarkdownFile } from '../utils/fileReader';

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mx-auto h-10 w-10 text-slate-400">
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Upload control for a single Markdown file. Click-to-browse and
 * drag-and-drop both funnel through `handleFile`, so validation and error
 * reporting stay in one place. `compact` swaps the large first-run dropzone
 * for a small "Choose another file" button reused in the toolbar.
 */
export default function FileUploader({ onFileLoaded, onError, compact = false }) {
  const inputId = useId();
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      try {
        const content = await readMarkdownFile(file);
        onFileLoaded(content, file.name);
      } catch (err) {
        onError(err.message || 'The file could not be loaded.');
      }
    },
    [onFileLoaded, onError]
  );

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const hiddenInput = (
    <input
      id={inputId}
      type="file"
      accept=".md,.markdown,text/markdown"
      onChange={handleInputChange}
      className="peer sr-only"
    />
  );

  if (compact) {
    return (
      <>
        {hiddenInput}
        <label
          htmlFor={inputId}
          className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600"
        >
          Choose another file
        </label>
      </>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors sm:p-14 ${
        isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white'
      }`}
    >
      {hiddenInput}
      <UploadIcon />
      <p className="mt-4 text-base font-medium text-slate-900">Upload a Markdown file to get started</p>
      <p className="mt-1 text-sm text-slate-500">Drag and drop, or choose a .md file up to 5&nbsp;MB</p>
      <label
        htmlFor={inputId}
        className="mt-6 inline-flex cursor-pointer items-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600"
      >
        Choose Markdown File
      </label>
    </div>
  );
}
