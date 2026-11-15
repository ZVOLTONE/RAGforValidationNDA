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
  surface: '#1A1A18',
  surfaceMuted: '#242422',
  border: '#333330',
  borderStrong: '#50504B',
  text: '#F5F5F2',
  textSecondary: '#C0C0BA',
  primary: '#F5F5F2',
  onPrimary: '#171715',
  primarySoft: '#2B2B28',
  danger: '#FF8A80',
  dangerSoft: '#3A1717',
  warningSoft: '#332613',
  quoteBackground: '#222220',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export function useDesign(): DesignTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK : LIGHT;
}
