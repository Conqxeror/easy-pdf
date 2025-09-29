// Simple slugify utility used across the app to create consistent URL-friendly slugs
export function slugify(input) {
  if (!input && input !== 0) return '';
  return String(input)
    .toLowerCase()
    .trim()
    // replace any sequence of non-alphanumeric characters with a single dash
    .replace(/[^a-z0-9]+/g, '-')
    // remove leading/trailing dashes
    .replace(/^-+|-+$/g, '');
}

export default slugify;
