import { StyleSheet } from "react-native";
export default StyleSheet.create({
  messagesSent: {
    maxWidth: 250,
    borderRadius: 20,
    borderBottomRightRadius: 5,
    padding: 10,
    backgroundColor: "#9b59b6",
  },
  messagesReceived: {
    maxWidth: 250,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    padding: 10,
    backgroundColor: "#ecf0f1",
  },
  flexend: {
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  flexstart: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newMsgDate: {
    textAlign: "center",
    color: "#7f8c8d",
    paddingVertical: 10,
  },
  formattedTime: {
    fontSize: 12,
    color: "#fff",
    textAlign: "right",
    paddingTop: 5,
  },
  groupChatHeader: {
    justifyContent: "flex-end",
    marginRight: 3,
  },
});
