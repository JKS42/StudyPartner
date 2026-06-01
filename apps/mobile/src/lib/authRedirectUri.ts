import Constants from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { isValidAuthRedirectUri } from './authRedirectValidation';

export { isValidAuthRedirectUri } from './authRedirectValidation';

function getExpoGoRedirectUri(): string {
  const auto = makeRedirectUri({
    path: 'auth/callback',
    preferLocalhost: false,
  });
  if (auto.startsWith('exp://') && isValidAuthRedirectUri(auto)) {
    return auto;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const built = `exp://${hostUri}/--/auth/callback`;
    if (isValidAuthRedirectUri(built)) return built;
  }

  return auto;
}

export function getAuthRedirectUri(): string {
  const override = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI?.trim();
  if (override && isValidAuthRedirectUri(override)) {
    return override;
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/auth/callback`;
    }
    return makeRedirectUri({ path: 'auth/callback' });
  }

  // Expo Go (iOS/Android): must use exp:// — studypartner:// is invalid in Safari
  if (Constants.appOwnership === 'expo') {
    return getExpoGoRedirectUri();
  }

  return makeRedirectUri({
    scheme: 'studypartner',
    path: 'auth/callback',
    preferLocalhost: false,
  });
}
