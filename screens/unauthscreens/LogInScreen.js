import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications";
import ForgotPasswordModal from "./ForgotPasswordModal";
import LottieView from "lottie-react-native";
import CustomButton from "../../components/CustomButton";

const LogInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loggingInSpinner, setLoggingInSpinner] = useState(false);
  const [logInDisabled, setLogInDisabled] = useState(false);

  const toast = useToast();
  const animation = useRef(null);

  useEffect(() => {
    // You can control the ref programmatically, rather than using autoPlay
    animation.current?.play();
  }, []);
  const handleSignIn = () => {
    if (!email || !password) {
      toast.show("Please enter a valid email and password", {
        type: "warning",
        placement: "top",
      });
    } else {
      setLoggingInSpinner(true);
      setLogInDisabled(true);
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          // setLoggingInSpinner(false);
          // ...
        })
        .catch((error) => {
          setLoggingInSpinner(false);
          setLogInDisabled(false);
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(errorCode, "-- error signing in --", errorMessage);
          toast.show(errorMessage, {
            type: "danger",
            placement: "top",
          });
        });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          // backgroundColor: "red",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LottieView
          autoPlay
          ref={animation}
          style={{
            width: 350,
            height: 350,
            alignSelf: "center",
          }}
          // Find more Lottie files at https://lottiefiles.com/featured
          source={require("../../assets/106068-chat.json")}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.userInfoInputView}
      >
        <View style={styles.credentialInput}>
          <MaterialCommunityIcons
            name="email"
            size={24}
            color="lightgrey"
            style={{ marginRight: 5 }}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={{ flex: 1, fontSize: 18 }}
          />
        </View>
        <View style={styles.credentialInput}>
          <MaterialCommunityIcons
            name="onepassword"
            size={24}
            color="lightgrey"
            style={{ marginRight: 5 }}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={{ flex: 1, fontSize: 18 }}
            secureTextEntry
          />
        </View>
        <View
          style={{
            // backgroundColor: "purple",
            justifyContent: "flex-start",
            width: "80%",
          }}
        >
          <Text
            style={{ fontWeight: "bold" }}
            onPress={() => setModalVisible(true)}
          >
            Forgot Password?
          </Text>
        </View>

        <ForgotPasswordModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />

        <CustomButton
          title={"Log In"}
          onPress={handleSignIn}
          loading={loggingInSpinner}
          disabled={logInDisabled}
        />
        <Text style={{ fontSize: 16 }}>
          Don't have an account? You can
          <Text
            style={{ color: "#3498db", fontWeight: "bold" }}
            onPress={() => navigation.navigate("SignUp")}
          >
            {" "}
            sign up{" "}
          </Text>
          here!
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // paddingTop: 20,
  },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    paddingHorizontal: 5,
  },
  screenTitleText: {
    fontSize: 36,
    fontWeight: "800",
  },
  userInfoInputView: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
  },
  credentialInput: {
    flexDirection: "row",
    width: "80%",
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    marginVertical: 10,
    padding: 3,
  },
});
