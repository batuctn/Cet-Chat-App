import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContactsListScreen from "../../screens/authscreens/ContactsListScreen";
import AddContactScreen from "../../screens/authscreens/AddContactScreen/AddContactScreen";
import StoryScreen from "../../screens/authscreens/StoryScreen";

const Stack = createNativeStackNavigator();

const ContactsStack = () => {
  return (
    <Stack.Navigator initialRouteName="ContactsListScreen">
      <Stack.Screen name="ContactsListScreen" component={ContactsListScreen} />
      <Stack.Screen
        name="AddContactScreen"
        component={AddContactScreen}
        options={{
          title: "Add Friend",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="StoryScreen"
        component={StoryScreen}
      />
    </Stack.Navigator>
  );
};

export default ContactsStack;
