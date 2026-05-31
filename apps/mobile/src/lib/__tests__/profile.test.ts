import {
  getProfileDisplayName,
  getProfileGreetingName,
  getProfileHandle,
  normalizeUsername,
  validateUsername,
} from '../profile';

describe('profile username', () => {
  it('normalizes username input', () => {
    expect(normalizeUsername('  @StudyHero  ')).toBe('studyhero');
  });

  it('accepts valid username', () => {
    expect(validateUsername('study_hero42')).toBeNull();
  });

  it('rejects too short username', () => {
    expect(validateUsername('ab')).toMatch(/3 characters/);
  });

  it('rejects invalid characters', () => {
    expect(validateUsername('1bad')).toMatch(/start with a letter/);
  });

  it('builds display name and handle', () => {
    expect(getProfileDisplayName({ display_name: 'Alex', username: 'alex_st' })).toBe('Alex');
    expect(getProfileHandle({ username: 'alex_st' })).toBe('@alex_st');
  });

  it('prefers username for dashboard greeting', () => {
    expect(getProfileGreetingName({ display_name: 'user@email.com', username: 'alex_st' })).toBe(
      'alex_st'
    );
    expect(getProfileGreetingName({ display_name: 'Alex Smith' })).toBe('Alex');
  });
});
