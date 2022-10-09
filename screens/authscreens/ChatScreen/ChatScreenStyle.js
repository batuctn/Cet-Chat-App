import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    alignSelf: "center",
    marginLeft: 5,
    fontSize: 20,
    fontWeight: "bold",
  },
  badgeStyle: {
    height: 23,
    minWidth: 23,
    maxWidth: 35,
    borderRadius: 15,
    backgroundColor: "#9b59b6",
    marginRight: 15,
  },
  nomessageView: { marginTop: 80, alignItems: "center" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 15,
  },
  messageInput: {
    bottom: 0,
    height: 40,
    flex: 1,
    marginRight: 15,
    backgroundColor: "#ececec",
    padding: 10,
    borderRadius: 30,
  },
  typingView: {
    width: 60,
    height: 40,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    marginHorizontal: 8,
    marginTop: 5,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
});
