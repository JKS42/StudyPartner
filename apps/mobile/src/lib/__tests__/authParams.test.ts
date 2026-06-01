import { extractAuthParams } from '../authParams';

describe('extractAuthParams', () => {
  it('reads PKCE code from query string', () => {
    const params = extractAuthParams('studypartner://auth/callback?code=abc123');
    expect(params.code).toBe('abc123');
  });

  it('reads tokens from hash fragment', () => {
    const params = extractAuthParams(
      'studypartner://auth/callback#access_token=at&refresh_token=rt'
    );
    expect(params.access_token).toBe('at');
    expect(params.refresh_token).toBe('rt');
  });

  it('reads OAuth error params', () => {
    const params = extractAuthParams(
      'studypartner://auth/callback?error=access_denied&error_description=User%20denied'
    );
    expect(params.error).toBe('access_denied');
    expect(params.error_description).toBe('User denied');
  });
});
