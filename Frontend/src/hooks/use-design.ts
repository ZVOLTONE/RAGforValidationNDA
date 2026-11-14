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
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F6',
  border: '#DBE2EA',
  borderStrong: '#B9C5D2',
  text: '#0D1B2A',
  textSecondary: '#55677A',
  primary: '#0B57D0',
  onPrimary: '#FFFFFF',
  primarySoft: '#E4EDFB',
  danger: '#C62828',
  dangerSoft: '#FDECEA',
  warningSoft: '#FFF4E5',
  quoteBackground: '#F1F4F8',
  overlay: 'rgba(13, 27, 42, 0.45)',
};

const DARK: DesignTokens = {
  dark: true,
  background: '#0A121A',
  surface: '#141E28',
  surfaceMuted: '#1B2733',
  border: '#27333F',
  borderStrong: '#3A4A59',
  text: '#F2F6FA',
  textSecondary: '#A3B3C2',
  primary: '#6FA8FF',
  onPrimary: '#04121F',
  primarySoft: '#16283D',
  danger: '#FF8A80',
  dangerSoft: '#3A1717',
  warningSoft: '#332613',
  quoteBackground: '#1A2632',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export function useDesign(): DesignTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK : LIGHT;
}
