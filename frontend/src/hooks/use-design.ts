import { useColorScheme } from '@/hooks/use-color-scheme';

export interface DesignTokens {
  dark: boolean;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  primary: string;
  onPrimary: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  warningSoft: string;
  quoteBackground: string;
  overlay: string;
}

const LIGHT: DesignTokens = {
  dark: false,
  background: '#F7F7F6',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F0EE',
  border: '#E1E1DE',
  borderStrong: '#B9B9B4',
  text: '#171715',
  textSecondary: '#575752',
  primary: '#171715',
  onPrimary: '#FFFFFF',
  primarySoft: '#EBEBE8',
  danger: '#C62828',
  dangerSoft: '#FDECEA',
  warningSoft: '#FFF4E5',
  quoteBackground: '#F1F1EF',
  overlay: 'rgba(23, 23, 21, 0.45)',
};

const DARK: DesignTokens = {
  dark: true,
  background: '#111110',
  surface: '#181816',
  surfaceMuted: '#22221f',
  border: '#2a2a27',
  borderStrong: '#3f3f3a',
  text: '#F5F5F2',
  textSecondary: '#A1A1AA',
  primary: '#14B8A6',
  onPrimary: '#0A0A08',
  primarySoft: '#132826',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.12)',
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  quoteBackground: '#141412',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export function useDesign(): DesignTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK : LIGHT;
}
