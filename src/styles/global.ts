import { StyleSheet } from "react-native";

export const colors = {
  background: "#000000",
  themeGrey: "#1a1a1a",
  gold: "#D4AF37",
  darkGold: "#B8860B",
  themeBlue: "#13336f",
  chartAxis: "#D4AF37",
  green: "#006600",
  changeGreen: "#00AA00",
  grey: "#888888",
  lightGrey: "#666666",
  red: "#e74c3c",
  orange: "#f39c12",
  white: "#ffffff"
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
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
    marginTop: 20,
    height: 160,
    width: '100%',
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  empty: {
    color: colors.gold,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
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
});
