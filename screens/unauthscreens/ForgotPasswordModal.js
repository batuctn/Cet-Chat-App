import { useState, useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import CustomButton from "../../components/CustomButton";

const ForgotPasswordModal = ({ modalVisible, setModalVisible }) => {
  const [email, setEmail] = useState("");
  const [resetPasswordSpinner, setResetPasswordSpinner] = useState(false);
  const [resetPasswordDisabled, setResetPasswordDisabled] = useState(false);

  const toast = useToast();

  const handleResetPassword = () => {
    if (!email) {
      toast.show("Please enter your email", {
        type: "danger",
        placement: "top",
      });
    } else {
      setResetPasswordSpinner(true);
      setResetPasswordDisabled(true);

      sendPasswordResetEmail(auth, email)
        .then(() => {
          setResetPasswordSpinner(false);
          setResetPasswordDisabled(false);
          setModalVisible(false);
          setEmail("");
          toast.show("Sent Password Reset Email", {
            type: "success",
            placement: "top",
          });
        })
        .catch((error) => {
          setResetPasswordSpinner(false);
          setResetPasswordDisabled(false);
          toast.show(error.message, {
            type: "danger",
            placement: "top",
          });
          console.error(
            error.code,
            "-- error sending password reset email --",
            error.message
          );
        });
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="formSheet"
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
        setEmail("");
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <Pressable
          onPress={() => {
            setModalVisible(false);
            setEmail("");
          }}
        >
          <View style={{ justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={32} color="#22a6b3" />
          </View>
        </Pressable>
        <View style={{ justifyContent: "center", alignSelf: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "800" }}>
            Forgot Password
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          // justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            // backgroundColor: "red",
            width: "80%",
            height: "80%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>
            Enter your email below and press the 'Reset Password' button. You
            will receive and email with instructions on how to reset your
            password.
          </Text>

          <View
            style={{
              width: "100%",
              justifyContent: "center",
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <TextInput
                value={email}
                placeholder="Email..."
                placeholderTextColor="#bbb"
                onChangeText={(text) => setEmail(text)}
                style={{
                  borderBottomWidth: 1,
                  height: 30,
                  textAlignVertical: "bottom",
                  fontSize: 20,
                }}
              />
              <View style={{ alignItems: "center" }}>
                <CustomButton
                  title={"Reset Password"}
                  onPress={handleResetPassword}
                  loading={resetPasswordSpinner}
                  disabled={resetPasswordDisabled}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </View>
      <StatusBar style="light" />
    </Modal>
  );
};

export default ForgotPasswordModal;

const styles = StyleSheet.create({
  passwordResetBtn: {
    backgroundColor: "#34495e",
    borderRadius: 10,
    width: 200,
    marginVertical: 20,
    alignItems: "center",
    elevation: 3,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "#333",
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  disabledPWResetBtn: {
    backgroundColor: "#bdc3c7",
    borderRadius: 10,
    borderColor: "#34495e",
    borderWidth: 1,
    width: 200,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "#333",
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
});
