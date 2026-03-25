const tintColorLight = '#2563EB';
const tintColorDark = '#1F2937';

export const Colors = {
  // App background
  appBackground: '#F9FAFB',
  
  // Board container
  boardContainer: '#FFFFFF',
  
  // Grid lines
  gridLineThin: '#D1D5DB',
  gridLineThick: '#9CA3AF',
  
  // Numbers
  numberNormal: '#1F2937',
  numberFixed: '#4B5563',
  numberSelected: '#2563EB',
  numberSameAsSelected: '#60A5FA',
  
  // Cell backgrounds
  cellBackground: '#FFFFFF',
  cellSelected: '#DBEAFE',
  cellError: '#FEE2E2',
  
  // Error colors
  error: '#DC2626',
  errorLight: '#FCA5A5',
  
  // Primary colors
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  
  // Gray scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',
  textError: '#DC2626',
  
  // Shadows
  shadow: 'rgba(0,0,0,0.08)',
  shadowDark: 'rgba(0,0,0,0.15)'
} as const;

export type ColorKey = keyof typeof Colors;

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};