import { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ContactsStack from "./ContactsStack";
import ProfileStack from "./ProfileStack";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import ChatsListScreen from "../../screens/authscreens/ChatsListScreen";
import { UnreadMsgContext } from "../../context/UnreadMsgContext";
import useTheme from "../../hooks/useTheme";

const Tab = createBottomTabNavigator();

const AuthTabs = () => {
  const { totalUnreadMsgs, setTotalUnreadMsgs } = useContext(UnreadMsgContext);
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="ChatsTab"
      shifting={true}
      labeled={false}
      screenOptions={{
        // headerShown: false,
        headerTitleStyle: {
          fontSize: 36,
          fontWeight: "800",
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#22a6b3",
        tabBarInactiveTintColor: "#bdc3c7",
        tabBarStyle: {
          backgroundColor: theme.backgroundColor,
        },
      }}
    >
      <Tab.Screen
        name="ChatsTab"
        component={ChatsListScreen}
        options={{
          tabBarAccessibilityLabel: "Chats",
          tabBarBadge: totalUnreadMsgs,
          tabBarBadgeStyle: {
            backgroundColor: "#9b59b6",
            display: totalUnreadMsgs < 1 ? "none" : "flex",
            justifyContent: "center",
          },
          tabBarIcon: ({ color }) => (
            <Ionicons name="ios-chatbubbles" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ContactsTab"
        component={ContactsStack}
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: "Friends",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-friends" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-sharp" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AuthTabs;
