import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../firebaseConfig";
import { doc, collection, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import styles from "../../components/AddFriendListItem/AddFriendListItemStyle";

const AddFriendListItem = ({ user, currentFriends }) => {
  const [alreadyFriends, setAlreadyFriends] = useState(false);
  const friendsCollRef = collection(
    db,
    "users",
    auth.currentUser.uid,
    "friends"
  );

  useEffect(() => {
    checkIfFriends();
  }, [currentFriends]);

  const addFriend = async () => {
    try {
      await setDoc(doc(friendsCollRef, user.userId), {
        userId: user.userId,
      });
    } catch (error) {
      console.error(error.code, "-- error adding friend --", error.message);
    }
  };

  const checkIfFriends = () => {
    {
      currentFriends &&
        currentFriends.some((friend) => friend.userId === user.userId) &&
        setAlreadyFriends(true);
    }
  };

  return (
    <ListItem>
      <Avatar source={{ uri: user.photoURL }} rounded size="medium" />
      <ListItem.Content>
        <View style={styles.viewContent}>
          <ListItem.Title style={styles.ItemTitle}>
            {user.displayName}
          </ListItem.Title>
          <ListItem.Title>
            <Pressable onPress={addFriend} disabled={alreadyFriends}>
              <Ionicons
                name="add-circle"
                size={30}
                color={alreadyFriends ? "#bdc3c7" : "#22a6b3"}
              />
            </Pressable>
          </ListItem.Title>
        </View>
        <ListItem.Subtitle>
          {alreadyFriends && <Text>Friend</Text>}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
};

export default AddFriendListItem;
