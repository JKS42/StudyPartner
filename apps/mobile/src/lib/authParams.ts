/** Parse OAuth callback query and hash params from a deep link URL. */
export function extractAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');

  const appendSearch = (search: string) => {
    const normalized = search.startsWith('?') ? search.slice(1) : search;
    if (!normalized) return;
    for (const [key, value] of new URLSearchParams(normalized)) {
      params[key] = value;
    }
  };

  if (queryIndex >= 0) {
    const end = hashIndex >= 0 ? hashIndex : url.length;
    appendSearch(url.slice(queryIndex + 1));
  }
  if (hashIndex >= 0) {
    appendSearch(url.slice(hashIndex + 1));
  }

  return params;
}
