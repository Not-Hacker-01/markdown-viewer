import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { markdownSanitizeSchema } from '../utils/sanitizeSchema';

const components = {
  // Open external links safely in a new tab; leave same-page anchors alone.
  a: ({ href, ...props }) => (
    <a
      {...props}
      href={href}
      target={href?.startsWith('#') ? undefined : '_blank'}
      rel={href?.startsWith('#') ? undefined : 'noopener noreferrer'}
    />
  ),
  // Wide tables scroll inside their own container instead of overflowing the page.
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
};

/**
 * Renders sanitized GitHub-Flavored Markdown as a read-only document.
 * Pipeline: remark-gfm (tables/strikethrough/task-lists/autolinks) →
 * rehype-raw (parse embedded raw HTML into the tree) → rehype-sanitize
 * (strip anything unsafe — must run after rehype-raw, since that's what
 * turns raw HTML strings into nodes it can inspect) → rehype-highlight
 * (code coloring, runs last so its own generated classNames aren't
 * stripped by sanitize).
 */
export default function MarkdownViewer({ source, containerRef }) {
  return (
    <div
      ref={containerRef}
      className="prose prose-slate max-w-none prose-code:before:content-none prose-code:after:content-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema], rehypeHighlight]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
