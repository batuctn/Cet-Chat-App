import { StyleSheet, View } from "react-native";
import { ListItem, Avatar } from "react-native-elements";

const GroupChatMemberInfo = ({ friend }) => {
  return (
    <ListItem>
      <Avatar size="medium" source={{ uri: friend.photoURL }} rounded />
      <ListItem.Content>
        <View style={styles.ContentView}>
          <ListItem.Title style={styles.itemTitle}>
            {friend.displayName}
          </ListItem.Title>
        </View>
      </ListItem.Content>
    </ListItem>
  );
};

export default GroupChatMemberInfo;

const styles = StyleSheet.create({
  ContentView: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
});
