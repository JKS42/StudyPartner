import * as Linking from 'expo-linking';

/** Parse OAuth callback query/hash params from a deep link URL. */
export function extractAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const parsed = Linking.parse(url);
  const queryParams = parsed.queryParams ?? {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (typeof value === 'string') {
      params[key] = value;
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      params[key] = value[0];
    }
  }

  const hashIndex = url.indexOf('#');
  if (hashIndex >= 0) {
    const hash = url.slice(hashIndex + 1);
    for (const [key, value] of new URLSearchParams(hash)) {
      params[key] = value;
    }
  }

  return params;
}
