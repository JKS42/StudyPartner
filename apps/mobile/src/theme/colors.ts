/** StudyPartner design tokens — warm, card-forward UI inspired by modern billing apps */

export const palette = {
  orange: '#E8672A',
  orangeDark: '#C4521A',
  orangeLight: '#F4A261',
  cream: '#FFF8F0',
  creamDark: '#F5EDE3',
  navy: '#0F2744',
  navyLight: '#1A3A5C',
  teal: '#1A8A7D',
  tealLight: '#2A9D8F',
  yellow: '#F5C542',
  blue: '#4A7FD4',
  coral: '#E85D4C',
  white: '#FFFFFF',
  black: '#1A1A1A',
  muted: '#6B7280',
  emptyBlue: '#7EC8E3',
};

export const cardAccents = [palette.teal, palette.yellow, palette.blue, palette.coral, palette.orangeLight];

export const lightTheme = {
  background: palette.navy,
  surface: palette.navyLight,
  text: palette.white,
  textMuted: 'rgba(255,255,255,0.75)',
  textOnPrimary: palette.white,
  border: 'rgba(255,255,255,0.12)',
  primary: palette.orange,
  primaryDark: palette.orangeDark,
  secondary: palette.teal,
  tabBar: palette.navy,
  tabBarActive: palette.orange,
  card: palette.navyLight,
  tabInactive: '#9CA3AF',
  heroGradient: palette.orange,
  inputBg: palette.navyLight,
  emptyBlue: palette.emptyBlue,
  shadow: 'rgba(0, 0, 0, 0.25)',
};

export const darkTheme = {
  background: '#0D1B2A',
  surface: palette.navy,
  text: palette.white,
  textMuted: 'rgba(255,255,255,0.75)',
  textOnPrimary: palette.white,
  border: '#1E3A5F',
  primary: palette.orangeLight,
  primaryDark: palette.orange,
  secondary: palette.tealLight,
  tabBar: '#081828',
  tabBarActive: palette.orangeLight,
  card: palette.navyLight,
  tabInactive: '#6B7280',
  heroGradient: palette.orangeDark,
  inputBg: palette.navyLight,
  emptyBlue: palette.emptyBlue,
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export type AppTheme = typeof lightTheme;

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
