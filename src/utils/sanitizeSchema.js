import { defaultSchema } from 'rehype-sanitize';

/**
 * Sanitize schema for untrusted Markdown/HTML, extending rehype-sanitize's
 * default GitHub-style schema so GFM task-list checkboxes (`- [ ]`) survive
 * sanitization. Scripts, event handlers, javascript: URLs, and unknown tags
 * remain stripped by the default schema.
 */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'input'],
  attributes: {
    ...defaultSchema.attributes,
    input: ['type', 'checked', 'disabled'],
  },
};
