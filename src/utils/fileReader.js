import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from './constants';

/** Raised for any file the uploader should reject; `code` lets callers branch, `message` is user-facing. */
export class MarkdownFileError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'MarkdownFileError';
    this.code = code;
  }
}

function hasMarkdownExtension(fileName) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Validates and reads a single uploaded file as Markdown source text.
 * @param {File} file - the file selected via input or drag-and-drop
 * @returns {Promise<string>} the file's text content
 * @throws {MarkdownFileError} for missing/wrong-type/oversized/unreadable/empty files
 */
export function readMarkdownFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new MarkdownFileError('NO_FILE', 'No file was selected.'));
      return;
    }
    if (!hasMarkdownExtension(file.name)) {
      reject(
        new MarkdownFileError(
          'INVALID_TYPE',
          `"${file.name}" is not a Markdown file. Choose a .md or .markdown file.`
        )
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      reject(
        new MarkdownFileError(
          'TOO_LARGE',
          `"${file.name}" is larger than ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB. Choose a smaller file.`
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      reject(
        new MarkdownFileError('READ_ERROR', `"${file.name}" could not be read. It may be corrupted.`)
      );
    };
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      if (content.trim().length === 0) {
        reject(new MarkdownFileError('EMPTY', `"${file.name}" is empty. Upload a file with Markdown content.`));
        return;
      }
      resolve(content);
    };
    reader.readAsText(file);
  });
}
