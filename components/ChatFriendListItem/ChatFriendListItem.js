import { View } from "react-native";
import { useState, useEffect } from "react";
import { ListItem, Avatar } from "react-native-elements";
import { CheckBox } from "react-native-elements";
import styles from "../../components/ChatFriendListItem/ChatFriendListItemStyle";

const ChatFriendListItem = ({
  friend,
  friends,
  setFriends,
  chatWith,
  setChatWith,
  setChatterIds,
}) => {
  const [checked, setChecked] = useState(friend.chattingWith);

  useEffect(() => {
    if (checked) {
      let newFriends = friends.map((person) => {
        if (friend.userId === person.userId) {
          return { ...person, chattingWith: true };
        } else {
          return person;
        }
      });
      setFriends(newFriends);

      let chatters = chatWith;
      {
        !chatters.some((chatter) => chatter.userId === friend.userId) &&
          chatters.push(friend);
      }

      setChatWith(chatters);

      setChatterIds(
        chatters.map((chatter) => {
          return chatter.userId;
        })
      );
    } else {
      let newFriends = friends.map((person) => {
        if (friend.userId === person.userId) {
          return { ...person, chattingWith: false };
        } else {
          return person;
        }
      });
      setFriends(newFriends);

      let chatters = chatWith.filter((chatter) => {
        if (chatter.userId !== friend.userId) {
          return chatter;
        }
      });
      setChatWith(chatters);

      setChatterIds(
        chatters.map((chatter) => {
          return chatter.userId;
        })
      );
    }
  }, [checked]);

  return (
    <ListItem>
      <Avatar size="medium" source={{ uri: friend.photoURL }} rounded />
      <ListItem.Content>
        <View style={styles.viewContent}>
          <ListItem.Title style={styles.ItemTitle}>
            {friend.displayName}
          </ListItem.Title>
          <CheckBox
            checked={checked}
            checkedColor="#9b59b6"
            onPress={() => setChecked(!checked)}
          />
        </View>
      </ListItem.Content>
    </ListItem>
  );
};

export default ChatFriendListItem;
