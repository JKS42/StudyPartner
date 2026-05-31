import { useColorScheme } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { darkTheme, lightTheme, type AppTheme } from './colors';

export function useAppTheme(): AppTheme {
  const system = useColorScheme();
  const preference = useThemeStore((s) => s.preference);

  const resolved =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  return resolved === 'dark' ? darkTheme : lightTheme;
}

export { lightTheme, darkTheme, palette, radius, spacing, cardAccents } from './colors';
export { typography } from './typography';
