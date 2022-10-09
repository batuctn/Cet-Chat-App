import { Alert, Pressable, View } from "react-native";
import { useState, useEffect } from "react";
import { ListItem, Avatar } from "react-native-elements";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { auth, db } from "../../firebaseConfig";
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from "@react-navigation/native";
import styles from "../../components/ContactListItem/ContactListItemStyle";

const ContactListItem = ({ friend, navigation }) => {
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadMsgs, setUnreadMsgs] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [story, setStory] = useState(null);
  const isFocused = useIsFocused();

  const user = auth.currentUser;
  const toast = useToast();

  const groupsRef = collection(db, "groups");
  const qGroups = query(
    groupsRef,
    where("members", "in", [
      [user.uid, friend.userId],
      [friend.userId, user.uid],
    ])
  );

  const getStory = async () => {
    const q = query(
      collection(db, "users"),
      where("userId", "==", friend.userId)
    );

    await getDocs(q).then((res) => {
      const _users = res.docs.map((item) => item.data());

      setStory(_users[0]?.storyPhotoUrl);
    });
  };

  useEffect(() => {
    getStory();
  }, [isFocused]);
  useEffect(() => {
    if (story) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [story]);

  useEffect(() => {
    const unsubGroups = onSnapshot(qGroups, (snapshot) => {
      setGroups(
        snapshot.docs.map((doc) => {
          return {
            ...doc.data(),
            groupId: doc.id,
          };
        })
      );
    });

    return unsubGroups;
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      const chatsRef = collection(db, "chats");
      const messagesRef = collection(chatsRef, groups[0].groupId, "messages");

      const q = query(messagesRef, orderBy("createdAt"));

      const unsubMessages = onSnapshot(q, (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              messageId: doc.id,
            };
          })
        );
      });

      return unsubMessages;
    }
  }, [groups]);

  useEffect(() => {
    if (messages.length > 0) {
      let gettingUnreadMsgs = [];
      messages.map((message) => {
        message.readBy.map((checkRead) => {
          if (checkRead.userId === user.uid && checkRead.readMsg === false) {
            gettingUnreadMsgs.push(message);
          }
        });
      });
      setUnreadMsgs(gettingUnreadMsgs.length);
    }
  }, [messages]);

  const goToChatScreen = async () => {
    try {
      if (groups.length === 0) {
        const groupDoc = await addDoc(groupsRef, {
          groupPhotoUrl: "",
          groupName: "",
          members: [user.uid, friend.userId],
          memberIsTyping: false,
        })
          .then(async (groupDoc) => {
            await updateDoc(doc(groupsRef, groupDoc.id), {
              groupId: groupDoc.id,
            });
            navigation.navigate("ChatScreen", {
              friendUserId: friend.userId,
              friendPhotoURL: friend.photoURL,
              friendDisplayName: friend.displayName,
              groupMembers: [user.uid, friend.userId],
              groupId: groupDoc.id,
              unreadMsgs: unreadMsgs,
            });
          })
          .catch((error) => {
            toast.show(error.message, {
              type: "danger",
            });
            console.error(
              error.code,
              "-- error adding new group --",
              error.message
            );
          });
      } else {
        navigation.navigate("ChatScreen", {
          friendUserId: friend.userId,
          friendPhotoURL: friend.photoURL,
          friendDisplayName: friend.displayName,
          groupMembers: [user.uid, friend.userId],
          groupId: groups[0].groupId,
          messages: messages,
          unreadMsgs: unreadMsgs,
        });
      }
    } catch (error) {
      console.error(
        error.code,
        "-- error going to chat screen --",
        error.message
      );
    }
  };

  const deleteFriend = async () => {
    try {
      const user = auth.currentUser;
      const friendRef = doc(db, "users", user.uid, "friends", friend.userId);
      await deleteDoc(friendRef);
    } catch (error) {
      Alert.alert(error.code, error.message, { text: "Ok" });
      console.error(error.code, "-- error deleting friend --", error.message);
    }
  };

  const rightSwipeActions = () => {
    return (
      <Pressable onPress={deleteFriend}>
        <View style={styles.rightSwipeActions}>
          <MaterialCommunityIcons name="delete" size={28} color="#fff" />
        </View>
      </Pressable>
    );
  };

  return (
    <Swipeable renderRightActions={rightSwipeActions}>
      <ListItem>
        <Avatar
          onPress={() => {
            isActive === true
              ? navigation.navigate("StoryScreen", {
                  friendUserId: friend.userId,
                  friendPhotoURL: friend.photoURL,
                  friendDisplayName: friend.displayName,
                  StoryUrl: story,
                })
              : null;
          }}
          size="medium"
          source={{ uri: friend.photoURL }}
          rounded
          containerStyle={isActive ? styles.avatar : null}
        />

        <ListItem.Content>
          <View style={styles.ItemContent}>
            <ListItem.Title style={styles.itemTitle}>
              {friend.displayName}
            </ListItem.Title>
            <ListItem.Title>
              <Pressable onPress={goToChatScreen}>
                <Ionicons name="chatbubble" size={24} color="#9b59b6" />
              </Pressable>
            </ListItem.Title>
          </View>
        </ListItem.Content>
      </ListItem>
    </Swipeable>
  );
};

export default ContactListItem;
