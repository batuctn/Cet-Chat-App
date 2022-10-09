import { useContext, useEffect, useState, useLayoutEffect } from "react";
import { StyleSheet, Text, View, Pressable, FlatList } from "react-native";
import { auth, db, storage } from "../../firebaseConfig";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ChatListItem from "../../components/ChatListItem/ChatListItem";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Avatar } from "react-native-elements";
import { UnreadMsgContext } from "../../context/UnreadMsgContext";
import useTheme from "../../hooks/useTheme";
import { useToast } from "react-native-toast-notifications";
import uuid from "react-native-uuid";

const ChatsListScreen = ({ navigation, route }) => {
  const [chats, setChats] = useState([]);
  const [userFriendIds, setUserFriendIds] = useState([]);
  const { totalUnreadMsgs, setTotalUnreadMsgs } = useContext(UnreadMsgContext);

  const toast = useToast();
  const { theme } = useTheme();
  const user = auth.currentUser;
  const friendsRef = collection(db, "users", user.uid, "friends");
  const groupsRef = collection(db, "groups");
  const q = query(
    groupsRef,
    where("members", "array-contains", user.uid),
    orderBy("lastMessage.createdAt", "desc")
  );

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      toast.show("Camera permissions are currently denied", {
        type: "danger",
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      await UploadImageAsync({ uri: result.uri });
    }
  };
  async function UploadImageAsync({ uri }) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    //Image saved to firebase storage.
    const fileRef = ref(storage, `users/${user.uid}/images/${uuid.v4()}`);
    await uploadBytes(fileRef, blob);
    blob.close();
    const imagePath = await getDownloadURL(fileRef);
    console.log(imagePath);
    await updateDoc(doc(db, "users", user.uid), {
      storyPhotoUrl: imagePath,
    });
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chats",
      headerTitleStyle: { fontSize: 32, fontWeight: "800" },
      headerLeft: () => (
        <View style={{ paddingLeft: 10, flexDirection: "row" }}>
          <Avatar
            source={{ uri: user.photoURL }}
            size="small"
            rounded
            onPress={() => navigation.navigate("Profile")}
          />
          <View
            style={{
              marginLeft: 7,
              alignSelf: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {user.displayName}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <Pressable onPress={openCamera}>
            <Ionicons
              name="camera-outline"
              size={30}
              color="#9b59b6"
              style={{ marginTop: 2 }}
            />
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.navigate("SelectChattersListScreen", {
                userFriendIds: userFriendIds,
              })
            }
            style={{ paddingRight: 10, paddingLeft: 10 }}
          >
            <Ionicons name="create-outline" size={30} color="#9b59b6" />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, userFriendIds]);

  useEffect(() => {
    const unsubChatDetails = onSnapshot(q, (querySnapshot) => {
      setChats(
        querySnapshot.docs.map((doc) => {
          return { ...doc.data(), groupId: doc.id };
        })
      );
    });

    return unsubChatDetails;
  }, []);

  useEffect(() => {
    let totalMsgs = [];
    chats.forEach(async (chat) => {
      const messagesRef = collection(db, "chats", chat.groupId, "messages");
      const q = query(
        messagesRef,
        where("readBy", "array-contains", {
          readMsg: false,
          userId: user.uid,
        })
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        totalMsgs.push(doc.data());
      });

      setTotalUnreadMsgs(totalMsgs.length);
    });
  }, [chats]);

  useEffect(() => {
    const unsubFriendIds = onSnapshot(friendsRef, (querySnapshot) => {
      setUserFriendIds(
        querySnapshot.docs.map((doc) => {
          return { ...doc.data() };
        })
      );
    });
    return unsubFriendIds;
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <FlatList
        ItemSeparatorComponent={() => (
          <View
            style={{
              width: "90%",
              alignSelf: "center",
              borderBottomColor: "#dfe6e9",
              borderBottomWidth: 1,
            }}
          />
        )}
        data={chats}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            chats={chats}
            setChats={setChats}
            navigation={navigation}
          />
        )}
        keyExtractor={(item) => item.groupId}
        ListEmptyComponent={() => (
          <View style={{ marginTop: 80, alignItems: "center" }}>
            <MaterialCommunityIcons
              name="chat-remove"
              size={60}
              color="#bdc3c7"
            />
            <Text style={{ fontSize: 18, color: "#bdc3c7" }}>No Chats</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ChatsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
