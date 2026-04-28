import { StyleSheet } from "react-native";

export const colors = {
  background: "#000000",
  themeBackground: "0d0d0d",
  header: "#242444",
  surface: "#2a2a4a",
  primary: "#550000",
  text: "#550000",
  textSecondary: "#550000",
  alert: "#550000",
  date: "#550000",
  gold: "#B8860B",
  themeColorPrimary: "#13336f",
  chartAxis: "#B8860B",
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
    color: '#B8860B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: '#B8860B',
    marginBottom: 30,
    marginTop: 16,
  },
  chart: {
    flex: 1,
    marginTop: 0,
    height: 150,
    width: '100%',
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 40,
    marginRight: 0,
  },
});
