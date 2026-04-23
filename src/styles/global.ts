import { StyleSheet } from "react-native";

export const colors = {
background: "#1a1a2e",
header: "#242444",
surface: "#2a2a4a",
primary: "#4fc3f7",
text: "#ccc",
textSecondary: "#a0a0b0",
alert: "#ff5252",
date: "#DAA520",
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },                   
  boxes: {
  marginTop: 15,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 50,
    marginRight: 0,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginTop: 0,
    color: colors.text,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: "#ccc"
  } ,
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 30,
    marginTop: 16,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
