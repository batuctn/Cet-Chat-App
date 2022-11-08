import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  SafeAreaView,
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
import { UnreadMsgContext } from "../../../context/UnreadMsgContext";
import {
  addDoc,
  doc,
  deleteDoc,
  collection,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
  where,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import Message from "../../../components/Message/Message";
import { Avatar } from "react-native-elements";
import { useToast } from "react-native-toast-notifications";
import { Badge } from "react-native-elements";
import { TypingAnimation } from "react-native-typing-animation";
import FadeInOut from "react-native-fade-in-out";
import * as Location from "expo-location";
import useTheme from "../../../hooks/useTheme";
import LocationComponent from "../../../components/LocationComponent";
import styles from "../../authscreens/ChatScreen/ChatScreenStyle";
import { TouchableHighlight } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import DiyalogComponent from "../../../components/DiyalogComponent";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState(route.params.messages);
  const [textInput, setTextInput] = useState("");
  const [unreadMsgs, setUnreadMsgs] = useState([]);
  const [memberIsTyping, setMemberIsTyping] = useState(false);
  const { totalUnreadMsgs, setTotalUnreadMsgs } = useContext(UnreadMsgContext);
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const scrollViewRef = useRef();

  const toast = useToast();
  const { theme } = useTheme();
  const user = auth.currentUser;
  const groupRef = doc(db, "groups", route.params.groupId);
  const groupsRef = collection(db, "groups");
  const chatsRef = collection(db, "chats");
  const messagesRef = collection(chatsRef, route.params.groupId, "messages");
  const q = query(messagesRef, orderBy("createdAt"));
  const q2 = query(messagesRef, where("type", "==", "location"));
  const [locationFire, setLocationFire] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () =>
        route.params.groupName ? (
          <Text>{route.params.groupName}</Text>
        ) : (
          <View style={{ flexDirection: "row" }}>
            <Avatar
              source={{ uri: route.params.friendPhotoURL }}
              size="small"
              rounded
            />
            <Text style={styles.headerText}>
              {route.params.friendDisplayName}
            </Text>
          </View>
        ),
      headerLeft: () => (
        <Pressable onPress={() => navigation.navigate("ChatsListScreen")}>
          <View style={{ flexDirection: "row" }}>
            <Ionicons name="chevron-back" size={32} color="#9b59b6" />
            <View style={{ justifyContent: "center" }}>
              {totalUnreadMsgs > 0 && (
                <Badge
                  value={totalUnreadMsgs > 99 ? "99+" : totalUnreadMsgs}
                  textStyle={{ fontSize: 16 }}
                  badgeStyle={styles.badgeStyle}
                />
              )}
            </View>
          </View>
        </Pressable>
      ),
    });
  }, [navigation, totalUnreadMsgs]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", async () => {
        if (messages?.length > 0) {
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
      if (doc.data().memberIsTyping.memberId !== user.uid) {
        setMemberIsTyping(doc.data().memberIsTyping.isTyping);
      }
    });

    return unsubMemberIsTyping;
  }, []);

  useEffect(() => {
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
    const unsubLocMessages = onSnapshot(q2, (snapshot) => {
      setLocationFire(
        snapshot.docs.map((doc) => {
          return {
            ...doc.data(),
            messageId: doc.id,
          };
        })
      );
    });

    return unsubLocMessages;
  }, []);

  useEffect(() => {
    if (messages?.length > 0) {
      let gettingUnreadMsgs = [];
      messages.map((message) => {
        message.readBy.map((checkRead) => {
          if (checkRead.userId === user.uid && checkRead.readMsg === false) {
            gettingUnreadMsgs.push(message);
          }
        });
      });
      setUnreadMsgs(gettingUnreadMsgs);
    }
  }, [messages]);

  useEffect(() => {
    setTotalUnreadMsgs((prevState) => prevState - route.params.unreadMsgs);
  }, []);

  useEffect(() => {
    readMsgs();
  }, [unreadMsgs]);

  const onPressFunction = () => {
    scrollViewRef.current.scrollToEnd({ animating: true });
  };

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
      if (textInput !== "") {
        await addDoc(messagesRef, {
          type: "text",
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
      }
      setTextInput("");
    } catch (error) {
      toast.show("Trouble sending the message", {
        type: "danger",
      });
      console.error(error.code, "-- error sending message --", error.message);
    }
  };
  const handleSendLocation = async () => {
    try {
      let isMsgRead = [];
      route.params.groupMembers.forEach((member) => {
        if (member !== user.uid) {
          isMsgRead.push({ userId: member, readMsg: false });
        }
      });
      let { status } = await Location.requestForegroundPermissionsAsync();
      let location = await Location.getCurrentPositionAsync({});
      console.log("location", location);

      await addDoc(messagesRef, {
        type: "location",
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
        senderUserId: user.uid,
      }).then(async (newMessage) => {
        await updateDoc(doc(messagesRef, newMessage.id), {
          messageId: newMessage.id,
        });
      });
    } catch (error) {
      toast.show("Trouble sending the locaiton", {
        type: "danger",
      });
      console.error(error.code, "-- error sending location --", error.message);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: true })
          }
        >
          {messages?.length > 0 ? (
            messages?.map((message, index) => (
              <View key={message.messageId}>
                <Message
                  message={message}
                  index={index}
                  messages={messages}
                  onPress={showDialog}
                />
              </View>
            ))
          ) : (
            <View style={styles.nomessageView}>
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
          {locationFire
            ? locationFire?.map((item, index) => {
                return (
                  <View key={index}>
                    <LocationComponent
                      lat={item.latitude}
                      long={item.longitude}
                      senderUserId={item.senderUserId}
                    />
                  </View>
                );
              })
            : null}
          <FadeInOut visible={memberIsTyping}>
            {memberIsTyping && (
              <View style={styles.typingView}>
                <TypingAnimation
                  dotColor="#9b59b6"
                  dotMargin={10}
                  dotAmplitude={3}
                  dotSpeed={0.15}
                  dotRadius={5}
                  dotX={25}
                  dotY={-5}
                />
              </View>
            )}
          </FadeInOut>
        </ScrollView>
        <DiyalogComponent
          visible={visible}
          hideDialog={hideDialog}
          person={route.params.friendDisplayName}
        />
        <View style={styles.footer}>
          <TextInput
            placeholder="CetChat"
            value={textInput}
            onChangeText={(text) => setTextInput(text)}
            style={styles.messageInput}
            multiline={true}
            textAlignVertical="center"
            onPressIn={onPressFunction}
          />
          <Pressable onPress={handleSendLocation}>
            <Ionicons
              style={{ marginRight: 8 }}
              name="location"
              size={24}
              color={"#9b59b6"}
            />
          </Pressable>
          <Pressable onPress={handleSendMessage}>
            <FontAwesome name="send" size={24} color={"#9b59b6"} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
