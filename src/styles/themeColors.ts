import { colors } from './global';

export const ThemeColors = {
  gold: {
    primary: colors.gold,
    emphasis: colors.darkGold,
    tint: colors.goldTint,
  },
  silver: {
    primary: colors.silver,
    emphasis: colors.silver,
    tint: colors.silverTint,
  },
} as const;

export type MetalType = keyof typeof ThemeColors;

export const getMetalColors = (metal: MetalType) => ThemeColors[metal];