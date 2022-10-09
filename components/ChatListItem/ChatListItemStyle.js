import { StyleSheet } from "react-native";
export default StyleSheet.create({
  rightSwipeActionsView: {
    backgroundColor: "#eb4d4b",
    height: "100%",
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  groupView: {
    backgroundColor: "#bdc3c7",
    height: 50,
    width: 50,
    borderRadius: 25,
    alignSelf: "center",
    justifyContent: "center",
  },
  grouptext: {
    color: "#fff",
    textAlign: "center",
    fontSize: 42,
  },
  unreadMsgsView: { position: "absolute", top: 13, left: 52 },
  badgeStyle: {
    height: 23,
    minWidth: 23,
    maxWidth: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderColor: "#fff",
    borderWidth: 2,
    backgroundColor: "#9b59b6",
  },
  contentView: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemTitle: { fontWeight: "bold", width: "70%" },
  itemSubtitle: { height: 30, marginTop: 5, fontSize: 16 },
  typingView: {
    width: 60,
    height: 30,
    borderRadius: 20,
    borderBottomLeftRadius: 5,

    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
});
