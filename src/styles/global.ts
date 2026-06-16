import { StyleSheet } from "react-native";
import { darkColors, type ThemeColors } from "./themes";

export { darkColors, lightColors, type ThemeMode } from "./themes";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
  xxxl: 48,
};

export const typography = {
  font: {
    sm: 12,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
};

export type { ThemeColors };

export const colors: ThemeColors = darkColors;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  tabPageContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginTop: 0,
    color: colors.gold,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.darkGold,
    marginBottom: 30,
    marginTop: 16,
  },
  chart: {
    flex: 1,
    marginTop: 0,
    height: 160,
    width: '100%',
    backgroundColor: colors.background,
  },
  empty: {
    color: colors.gold,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 40,
    marginRight: 0,
  },
  button: {
    backgroundColor: colors.themeGrey,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.themeGrey,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.white,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderMid,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
    marginTop: 12,
  },
});

export const toggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.toggleBg,
    borderRadius: 8,
    padding: 4,
    marginBottom: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.gold,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.grey,
  },
  optionTextActive: {
    color: colors.background,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMid,
    backgroundColor: colors.themeGrey,
  },
  optionButtonActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldTint,
  },
  optionButtonText: {
    fontSize: 14,
    color: colors.grey,
  },
  optionButtonTextActive: {
    color: colors.gold,
    fontWeight: '600',
  },
});
