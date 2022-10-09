import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../screens/authscreens/ProfileScreen";

const Stack = createNativeStackNavigator();

const ContactsStack = () => {
  return (
    <Stack.Navigator initialRouteName="ProfileScreen">
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default ContactsStack;
