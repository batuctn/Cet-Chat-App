import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import UnauthStack from "./routes/unAuthRoutes/UnauthStack";
import { UnreadMsgContext } from "./context/UnreadMsgContext";
import ChatsStack from "./routes/authRoutes/ChatsStack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Avatar } from "react-native-elements";
import { ToastProvider } from "react-native-toast-notifications";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { MenuProvider } from "react-native-popup-menu";
import ThemeProvider from "./context/ThemeProvider";

export default function App() {
  const [user, setUser] = useState("");
  const [totalUnreadMsgs, setTotalUnreadMsgs] = useState(0);

  const renderType = {
    newMessage: (toast) => (
      <View
        style={{
          height: 50,
          width: "95%",
          backgroundColor: "#fff",
          borderColor: "#eee",
          borderRadius: 10,
          elevation: 3,
          shadowOffset: { width: 2, height: 2 },
          shadowColor: "#333",
          shadowOpacity: 0.4,
          shadowRadius: 2,
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            // width: "85%",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ alignSelf: "center" }}>
              <Avatar
                source={{ uri: toast.photoURL }}
                size="small"
                rounded
                containerStyle={{ marginRight: 10 }}
              />
            </View>
            <View>
              <Text
                style={{ fontWeight: "bold", fontSize: 20 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {toast.displayName}
              </Text>
              <Text
                style={{ fontSize: 15 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {toast.message}
              </Text>
            </View>
          </View>
          <View>
            <Text>{toast.createdAt}</Text>
          </View>
        </View>
      </View>
    ),
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
        setUser(user);
        // console.log(user);
      } else {
        // User is signed out
        // ...
        // console.log("user signed out");
        setUser("");
      }
    });

    return unsubAuth;
  }, []);

  return (
    <ThemeProvider>
      <UnreadMsgContext.Provider
        value={{ totalUnreadMsgs, setTotalUnreadMsgs }}
      >
        <ToastProvider
          renderType={renderType}
          offsetBottom={80}
          offsetTop={50}
          textStyle={{ fontSize: 16 }}
          duration={3000}
          successIcon={
            <Ionicons name="checkmark-circle-sharp" size={24} color="#fff" />
          }
          dangerIcon={<Ionicons name="md-warning" size={24} color="#fff" />}
          warningIcon={<MaterialIcons name="error" size={24} color="#fff" />}
        >
          <MenuProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                {!user ? <UnauthStack /> : <ChatsStack />}
                <StatusBar style="auto" />
              </NavigationContainer>
            </SafeAreaProvider>
          </MenuProvider>
        </ToastProvider>
      </UnreadMsgContext.Provider>
    </ThemeProvider>
  );
}
