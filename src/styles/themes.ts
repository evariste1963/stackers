export interface ThemeColors {
  background: string;
  themeGrey: string;
  toggleBg: string;
  gold: string;
  goldTint: string;
  silver: string;
  silverTint: string;
  darkGold: string;
  themeBlue: string;
  chartAxis: string;
  green: string;
  changeGreen: string;
  grey: string;
  lightGrey: string;
  borderDark: string;
  borderMid: string;
  red: string;
  orange: string;
  white: string;
  text: string;
}

export const darkColors: ThemeColors = {
  background: '#000000',
  themeGrey: '#1a1a1a',
  toggleBg: '#2a2a2a',
  gold: '#D4AF37',
  goldTint: 'rgba(212, 175, 55, 0.13)',
  silver: '#C0C0C0',
  silverTint: 'rgba(192, 192, 192, 0.13)',
  darkGold: '#B8860B',
  themeBlue: '#13336f',
  chartAxis: '#D4AF37',
  green: '#006600',
  changeGreen: '#00AA00',
  grey: '#888888',
  lightGrey: '#666666',
  borderDark: '#333333',
  borderMid: '#444444',
  red: '#e74c3c',
  orange: '#f39c12',
  white: '#ffffff',
  text: '#ffffff',
};

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  themeGrey: '#F2F2F7',
  toggleBg: '#E5E5EA',
  gold: '#D4AF37',
  goldTint: 'rgba(212, 175, 55, 0.1)',
  silver: '#8E8E93',
  silverTint: 'rgba(142, 142, 147, 0.1)',
  darkGold: '#B8860B',
  themeBlue: '#13336f',
  chartAxis: '#D4AF37',
  green: '#34C759',
  changeGreen: '#30D158',
  grey: '#8E8E93',
  lightGrey: '#C7C7CC',
  borderDark: '#D1D1D6',
  borderMid: '#E5E5EA',
  red: '#FF3B30',
  orange: '#FF9F0A',
  white: '#FFFFFF',
  text: '#000000',
};

export type ThemeMode = 'dark' | 'light';
