import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useContext,
} from "react";
import { UnreadMsgContext } from "../../context/UnreadMsgContext";
import {
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  collection,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
  EvilIcons,
  Feather,
} from "@expo/vector-icons";
import Message from "../../components/Message/Message";
import { Avatar, Button } from "react-native-elements";
import { useToast } from "react-native-toast-notifications";
import { useRoute } from "@react-navigation/native";
import { Badge } from "react-native-elements";
import { TypingAnimation } from "react-native-typing-animation";
import FadeInOut from "react-native-fade-in-out";

const GroupChatScreen = ({ route, navigation }) => {
  const [groupChatName, setGroupChatName] = useState(route.params.groupName);
  const [groupPhotoURL, setGroupPhotoURL] = useState(
    route.params.groupPhotoUrl
  );
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [unreadMsgs, setUnreadMsgs] = useState([]);
  const [memberIsTyping, setMemberIsTyping] = useState(false);
  const [userTypingInfo, setUserTypingInfo] = useState("");
  const { totalUnreadMsgs, setTotalUnreadMsgs } = useContext(UnreadMsgContext);
  const scrollViewRef = useRef();

  const toast = useToast();

  const currentRoute = useRoute();
  const user = auth.currentUser;
  const groupRef = doc(db, "groups", route.params.groupId);
  const groupsRef = collection(db, "groups");
  const chatsRef = collection(db, "chats");
  const messagesRef = collection(chatsRef, route.params.groupId, "messages");
  const q = query(messagesRef, orderBy("createdAt"));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View
          style={{
            // backgroundColor: "red",
            // maxWidth: "80%",
            flexDirection: "row",
            // justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!groupPhotoURL ? (
            <View
              style={{
                backgroundColor: "#bdc3c7",
                height: 35,
                width: 35,
                borderRadius: 20,
                alignSelf: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  textAlign: "center",
                  fontSize: 28,
                }}
              >
                {route.params.friendDisplayName.length}
              </Text>
            </View>
          ) : (
            <Avatar size="small" source={{ uri: groupPhotoURL }} rounded />
          )}
          <View
            style={{
              alignSelf: "center",
              maxWidth: "75%",
            }}
          >
            <Text
              style={{
                marginLeft: 5,
                fontSize: 20,
                fontWeight: "bold",
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {groupChatName
                ? groupChatName
                : route.params.friendDisplayName.join(", ")}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              navigation.navigate("GroupChatInfoScreen", {
                friendDisplayName: route.params.friendDisplayName,
                membersInfo: route.params.membersInfo,
                // chatInfo: route.params.chatInfo,
                groupName: route.params.groupName,
                groupId: route.params.groupId,
                groupPhotoURL: route.params.groupPhotoUrl,
              });
            }}
          >
            <Feather name="chevron-right" size={24} color="#bdc3c7" />
          </Pressable>
        </View>
      ),
      headerLeft: () => (
        <Pressable onPress={() => navigation.navigate("ChatsListScreen")}>
          {/* <Pressable onPress={() => goBack()}> */}
          <View style={{ flexDirection: "row" }}>
            <Ionicons name="chevron-back" size={32} color="#9b59b6" />
            <View
              style={{
                justifyContent: "center",
                // backgroundColor: "blue"
              }}
            >
              {totalUnreadMsgs > 0 && (
                <Badge
                  value={totalUnreadMsgs > 99 ? "99+" : totalUnreadMsgs}
                  textStyle={{ fontSize: 16 }}
                  badgeStyle={{
                    height: 23,
                    minWidth: 23,
                    maxWidth: 35,
                    borderRadius: 15,
                    backgroundColor: "#9b59b6",
                    marginRight: 5,
                  }}
                />
              )}
            </View>
          </View>
        </Pressable>
      ),
    });
  }, [navigation, totalUnreadMsgs, route, groupChatName, groupPhotoURL]);

  useEffect(() => {
    const groupRef = doc(db, "groups", route.params.groupId);
    // const groupRef = doc(db, "groups", route.params.chatInfo?.groupId);

    const unsubChatDetails = onSnapshot(groupRef, (doc) => {
      // console.log(doc.data());
      setGroupPhotoURL(doc.data().groupPhotoUrl);
      setGroupChatName(doc.data().groupName);
    });

    return unsubChatDetails;
  }, []);

  useEffect(() => {
    // console.log("checking groupId from chat screen", route.params.groupId);

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
  }, []);

  useEffect(() => {
    const chatsRef = collection(db, "chats");
    const messagesRef = collection(chatsRef, route.params.groupId, "messages");

    const q = query(
      messagesRef,
      where("readBy", "array-contains", { readMsg: false, userId: user.uid })
    );
    // console.log("checking groupId from chat screen", route.params.groupId);
    const unsubUnreadMsgs = onSnapshot(q, (snapshot) => {
      setUnreadMsgs(
        snapshot.docs.map((doc) => {
          return {
            ...doc.data(),
            messageId: doc.id,
          };
        })
      );
    });

    return unsubUnreadMsgs;
  }, []);

  useEffect(() => {
    setTotalUnreadMsgs((prevState) => prevState - route.params.unreadMsgs);
  }, []);

  useEffect(() => {
    readMsgs();
  }, [unreadMsgs]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", async () => {
        if (messages.length > 0) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }
        await deleteDoc(doc(groupsRef, route.params.groupId));
      }),
    [navigation, messages]
  );

  useEffect(() => {
    checkIfTyping();
  }, [textInput]);

  useEffect(() => {
    const unsubMemberIsTyping = onSnapshot(groupRef, (doc) => {
      console.log(doc.data().memberIsTyping.isTyping);
      if (doc.data().memberIsTyping.memberId !== user.uid) {
        setMemberIsTyping(doc.data().memberIsTyping.isTyping);
        // setMemberIsTyping(doc.data());
      }
    });

    return unsubMemberIsTyping;
  }, []);

  // useEffect(() => {
  //   if (memberIsTyping) {
  //     const userRef = doc(db, "users", memberIsTyping?.memberId);

  //     const unsubMemberTypingInfo = onSnapshot(userRef, (doc) => {
  //       setUserTypingInfo(doc.data());
  //     });

  //     return unsubMemberTypingInfo;
  //   } else {
  //     setUserTypingInfo("");
  //   }
  // }, [memberIsTyping]);

  const checkIfTyping = async () => {
    try {
      if (textInput) {
        await updateDoc(groupRef, {
          memberIsTyping: { memberId: user.uid, isTyping: true },
        });
      } else {
        await updateDoc(groupRef, {
          memberIsTyping: { memberId: user.uid, isTyping: false },
        });
      }
    } catch (error) {
      toast.show(error.message, {
        type: "danger",
      });
      console.error(
        error.code,
        "-- error checking if member is typing --",
        error.message
      );
    }
  };

  const onPressFunction = () => {
    scrollViewRef.current.scrollToEnd({ animating: true });
  };

  const readMsgs = () => {
    try {
      unreadMsgs.forEach((unreadMsg) => {
        unreadMsg.readBy.map((userRead) => {
          if (userRead.userId === user.uid) {
            userRead.readMsg = true;
          }
        });
      });
      unreadMsgs.forEach(async (unreadMsg) => {
        const unReadMsgRef = doc(
          db,
          "chats",
          route.params.groupId,
          "messages",
          unreadMsg.messageId
        );
        await updateDoc(unReadMsgRef, {
          readBy: unreadMsg.readBy,
        });
      });
    } catch (error) {
      toast.show("Trouble updating messages to read", {
        type: "danger",
      });
      console.error(
        error.code,
        "-- error updating messages to read --",
        error.message
      );
    }
  };

  const handleSendMessage = async () => {
    try {
      let isMsgRead = [];
      route.params.groupMembers.forEach((member) => {
        if (member !== user.uid) {
          isMsgRead.push({ userId: member, readMsg: false });
        }
      });
      const newMessage = await addDoc(messagesRef, {
        message: textInput,
        senderUserId: user.uid,
        readBy: isMsgRead,
        createdAt: serverTimestamp(),
      })
        .then(async (newMessage) => {
          await updateDoc(doc(messagesRef, newMessage.id), {
            messageId: newMessage.id,
          });
        })
        .then(async () => {
          await updateDoc(doc(groupsRef, route.params.groupId), {
            lastModified: serverTimestamp(),
            lastMessage: {
              message: textInput,
              createdAt: serverTimestamp(),
              sentBy: user.uid,
              senderDisplayName: user.displayName,
              senderPhotoURL: user.photoURL,
            },
          });
        });
      setTextInput("");
    } catch (error) {
      toast.show("Trouble sending the message", {
        type: "danger",
      });
      console.error(error.code, "-- error sending message --", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: true })
          }
        >
          {messages?.length !== 0 ? (
            messages?.map((message, index) => (
              <View key={message.messageId}>
                <Message message={message} index={index} messages={messages} />
              </View>
            ))
          ) : (
            <View style={{ marginTop: 80, alignItems: "center" }}>
              <MaterialCommunityIcons
                name="message-off"
                size={60}
                color="#bdc3c7"
              />
              <Text style={{ fontSize: 18, color: "#bdc3c7" }}>
                No Messages
              </Text>
            </View>
          )}
          <FadeInOut visible={memberIsTyping}>
            {memberIsTyping && (
              <View
                style={{
                  width: 60,
                  height: 40,
                  borderRadius: 20,
                  borderBottomLeftRadius: 5,
                  marginHorizontal: 8,
                  marginTop: 5,
                  justifyContent: "center",
                  backgroundColor: "#ecf0f1",
                }}
              >
                <TypingAnimation
                  dotColor="#9b59b6"
                  dotMargin={10}
                  dotAmplitude={3}
                  dotSpeed={0.15}
                  dotRadius={5}
                  dotX={25}
                  dotY={-5}
                  // style={{ alignSelf: "flex-start" }}
                />
              </View>
            )}
          </FadeInOut>
        </ScrollView>
        {/* <Button
          title="read chat info"
          onPress={() =>
            console.log("checking chat info:", route.params.chatInfo)
          }
        /> */}
        <View style={styles.footer}>
          <TextInput
            placeholder="Chat"
            value={textInput}
            onChangeText={(text) => setTextInput(text)}
            style={styles.messageInput}
            multiline={true}
            textAlignVertical="center"
            onPressIn={onPressFunction}
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!textInput ? true : false}
          >
            <FontAwesome
              name="send"
              size={24}
              color={!textInput ? "#ececec" : "#9b59b6"}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GroupChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
});
