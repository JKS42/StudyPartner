const PLACEHOLDER_PATTERN = /YOUR_IP|your-ip|REPLACE_ME|<.*>/i;

export function isValidAuthRedirectUri(uri: string): boolean {
  if (!uri?.trim() || uri.length < 12) return false;
  if (PLACEHOLDER_PATTERN.test(uri)) return false;
  if (uri.includes('localhost:3000')) return false;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(uri);
}
