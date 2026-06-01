import { isValidAuthRedirectUri } from '../authRedirectValidation';

describe('isValidAuthRedirectUri', () => {
  it('rejects placeholder YOUR_IP', () => {
    expect(isValidAuthRedirectUri('exp://YOUR_IP:8081/--/auth/callback')).toBe(false);
  });

  it('accepts exp and custom schemes', () => {
    expect(isValidAuthRedirectUri('exp://192.168.1.10:8081/--/auth/callback')).toBe(true);
    expect(isValidAuthRedirectUri('studypartner://auth/callback')).toBe(true);
  });
});
