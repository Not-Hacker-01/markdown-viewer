/**
 * Inline styles injected into cloned nodes before serializing to HTML for
 * the clipboard. Tailwind utility classes on the live DOM have no effect
 * once pasted into Word/Google Docs (no stylesheet travels with the
 * clipboard), so the elements that would otherwise look unstyled there
 * (tables, blockquotes, code) get minimal inline CSS instead.
 */
const CLIPBOARD_STYLES = {
  table: 'border-collapse:collapse;width:100%;',
  th: 'border:1px solid #d0d7de;padding:6px 13px;background:#f6f8fa;text-align:left;',
  td: 'border:1px solid #d0d7de;padding:6px 13px;',
  blockquote: 'margin:0 0 16px;padding:0 1em;color:#57606a;border-left:0.25em solid #d0d7de;',
  pre: 'font-family:ui-monospace,Consolas,monospace;background:#f6f8fa;border-radius:6px;padding:12px 16px;overflow:auto;',
  hr: 'border:none;border-top:1px solid #d0d7de;',
  inlineCode: 'font-family:ui-monospace,Consolas,monospace;background:#f6f8fa;border-radius:4px;padding:0.2em 0.4em;font-size:85%;',
};

function applyInlineStyle(el, style) {
  el.setAttribute('style', `${el.getAttribute('style') ?? ''}${style}`);
}

function inlineClipboardStyles(root) {
  root.querySelectorAll('table').forEach((el) => applyInlineStyle(el, CLIPBOARD_STYLES.table));
  root.querySelectorAll('th').forEach((el) => applyInlineStyle(el, CLIPBOARD_STYLES.th));
  root.querySelectorAll('td').forEach((el) => applyInlineStyle(el, CLIPBOARD_STYLES.td));
  root.querySelectorAll('blockquote').forEach((el) => applyInlineStyle(el, CLIPBOARD_STYLES.blockquote));
  root.querySelectorAll('pre').forEach((el) => applyInlineStyle(el, CLIPBOARD_STYLES.pre));
  root.querySelectorAll('hr').forEach((el) => applyInlineStyle(el, CLIPBOARD_STYLES.hr));
  root.querySelectorAll('code').forEach((el) => {
    if (!el.closest('pre')) applyInlineStyle(el, CLIPBOARD_STYLES.inlineCode);
  });
}

/** Builds a portable HTML fragment from the rendered container for clipboard export. */
function buildClipboardHtml(containerEl) {
  const clone = containerEl.cloneNode(true);
  inlineClipboardStyles(clone);
  return clone.innerHTML;
}

async function writeClipboardItem(payload) {
  const data = Object.fromEntries(
    Object.entries(payload).map(([type, value]) => [type, new Blob([value], { type })])
  );
  await navigator.clipboard.write([new ClipboardItem(data)]);
}

async function copyPlainTextOnly(plainText) {
  try {
    await navigator.clipboard.writeText(plainText);
    return { success: true, message: 'Copied as plain text' };
  } catch {
    return { success: false, message: 'Copy failed. Your browser blocked clipboard access.' };
  }
}

/**
 * Copies the rendered document to the clipboard as HTML, plain text, and
 * (where supported) the original Markdown — in one payload, so the paste
 * target picks the richest format it understands. Falls back to narrower
 * payloads, and finally to plain text, if the browser rejects a format.
 * @param {{ containerEl: HTMLElement, markdownSource: string }} args
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function copyRenderedMarkdown({ containerEl, markdownSource }) {
  if (!containerEl) {
    return { success: false, message: 'Nothing to copy yet.' };
  }
  if (!navigator.clipboard) {
    return { success: false, message: 'Clipboard access is not available in this browser.' };
  }
  if (typeof ClipboardItem === 'undefined') {
    return copyPlainTextOnly(containerEl.innerText);
  }

  const html = buildClipboardHtml(containerEl);
  const plainText = containerEl.innerText;

  const attempts = [
    { 'text/html': html, 'text/plain': plainText, 'text/markdown': markdownSource },
    { 'text/html': html, 'text/plain': plainText },
  ];

  for (const payload of attempts) {
    try {
      await writeClipboardItem(payload);
      return { success: true, message: 'Copied' };
    } catch {
      // browser rejected this MIME combination — try the next, narrower one
    }
  }

  return copyPlainTextOnly(plainText);
}
