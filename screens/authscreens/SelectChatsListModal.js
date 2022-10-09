import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import ChatListItem from "../../components/ChatListItem/ChatListItem";
import { useToast } from "react-native-toast-notifications";
import { db, auth } from "../../firebaseConfig.js";
import { useEffect, useState } from "react";

const SelectChatsListModal = ({
  modalVisible,
  setModalVisible,
  groups,
  navigation,
  chatWith,
  chatterIds,
  chatExists,
}) => {
  const [messages, setMessages] = useState([]);
  const [unreadMsgs, setUnreadMsgs] = useState([]);
  const user = auth.currentUser;
  const toast = useToast();

  const handleCreateNewChat = async () => {
    try {
      const groupsRef = collection(db, "groups");
      let memberNames = [];
      chatWith.forEach((chatter) => memberNames.push(chatter.displayName));

      let gettingAllChatterIds = chatterIds;
      {
        !gettingAllChatterIds.some((id) => id === user.uid) &&
          gettingAllChatterIds.push(user.uid);
      }

      const groupDoc = await addDoc(groupsRef, {
        groupPhotoUrl: "",
        groupName: "",
        members: gettingAllChatterIds,
        memberIsTyping: false,
      })
        .then(async (groupDoc) => {
          // console.log("new group id:", groupDoc.id);
          // console.log("new group info:", groupDoc.data());
          await updateDoc(doc(groupsRef, groupDoc.id), {
            groupId: groupDoc.id,
          });
          setModalVisible(false);
          if (chatWith.length === 1) {
            navigation.navigate("ChatScreen", {
              friendUserId: chatWith[0].userId,
              friendPhotoURL: chatWith[0].photoURL,
              friendDisplayName: chatWith[0].displayName,
              groupMembers: gettingAllChatterIds,
              groupId: groupDoc.id,
              unreadMsgs: unreadMsgs,
              messages: messages,
            });
          } else {
            navigation.navigate("GroupChatScreen", {
              groupId: groupDoc.id,
              groupMembers: gettingAllChatterIds,
              unreadMsgs: unreadMsgs,
              messages: messages,
              friendDisplayName: memberNames,
              membersInfo: chatWith,
            });
          }
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
    } catch (error) {
      toast.show(error.message, {
        type: "danger",
      });
      console.error(error.code, "-- error adding new group --", error.message);
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="formSheet"
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 1,
        }}
      >
        <Pressable
          style={{ justifyContent: "center" }}
          onPress={() => setModalVisible(false)}
        >
          <Ionicons name="chevron-back" size={32} color="#9b59b6" />
        </Pressable>
        <Text style={{ fontSize: 36, fontWeight: "800", padding: 10 }}>
          Existing Chats
        </Text>
      </View>
      <View
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 10 }}
      >
        <Button
          title="Create New Chat"
          icon={() => <Ionicons name="add" size={24} color="#fff" />}
          containerStyle={{ marginTop: 10 }}
          onPress={handleCreateNewChat}
          disabled={chatExists}
          // onPress={() => console.log("creating a new chat")}
        />
        <FlatList
          ItemSeparatorComponent={() => (
            <View
              style={{
                width: "100%",
                alignSelf: "center",
                borderBottomColor: "#dfe6e9",
                borderBottomWidth: 1,
              }}
            />
          )}
          data={groups}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              navigation={navigation}
              setModalVisible={setModalVisible}
            />
          )}
          keyExtractor={(item) => item.groupId}
        />
      </View>
      <StatusBar style="inverted" />
    </Modal>
  );
};

export default SelectChatsListModal;

const styles = StyleSheet.create({});
