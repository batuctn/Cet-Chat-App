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
import { Button } from "react-native-elements";
import { useToast } from "react-native-toast-notifications";
import { db } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";

const UpdateEmailModal = ({ modalVisible, setModalVisible, email, user }) => {
  const [password, setPassword] = useState("");
  const [passwordConfirmedSpinner, setPasswordConfirmedSpinner] =
    useState(false);
  const [passwordConfirmedDisabled, setPasswordConfirmedDisabled] =
    useState(false);

  const toast = useToast();

  const handleUpdateEmail = async () => {
    try {
      setPasswordConfirmedSpinner(true);
      setPasswordConfirmedDisabled(true);
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential)
        .then(async () => {
          await updateEmail(user, email);
        })
        .then(async () => {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            email: email,
          });
        })
        .then(() => {
          setPasswordConfirmedSpinner(false);
          setPasswordConfirmedDisabled(false);
          setModalVisible(false);
          setPassword("");
          toast.show("Successfully updated email", {
            type: "success",
          });
        });
    } catch (error) {
      setPasswordConfirmedSpinner(false);
      setPasswordConfirmedDisabled(false);
      setPassword("");
      setModalVisible(false);
      toast.show(error.message, {
        type: "danger",
      });
      console.error(error.code, "-- error updating email --", error.message);
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="formSheet"
      visible={modalVisible}
      onRequestClose={() => {
        setPassword("");
        setModalVisible(false);
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <Pressable
          onPress={() => {
            setPassword("");
            setModalVisible(false);
          }}
        >
          <View style={{ justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={32} color="#22a6b3" />
          </View>
        </Pressable>
        <View style={{ justifyContent: "center", alignSelf: "center" }}>
          <Text style={{ fontSize: 36, fontWeight: "800" }}>
            Confirm Password
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
            Enter your password below to authorize email update.
          </Text>
          {/* <Text>Email:</Text> */}
          <View
            style={{
              // backgroundColor: "green",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <TextInput
                value={password}
                placeholder="Password..."
                placeholderTextColor="#bbb"
                onChangeText={(text) => setPassword(text)}
                style={{
                  // backgroundColor: "orange",
                  borderBottomWidth: 1,
                  height: 30,
                  textAlignVertical: "bottom",
                  fontSize: 20,
                  padding: 5,
                }}
                secureTextEntry
              />
              <View style={{ alignItems: "center" }}>
                <Button
                  title="Confirm"
                  titleStyle={{ fontSize: 24 }}
                  onPress={handleUpdateEmail}
                  buttonStyle={{ backgroundColor: "#22a6b3" }}
                  containerStyle={{ width: 200, marginVertical: 20 }}
                  loading={passwordConfirmedSpinner}
                  disabled={passwordConfirmedDisabled}
                  disabledStyle={{ backgroundColor: "#b2bec3" }}
                  raised={true}
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

export default UpdateEmailModal;

const styles = StyleSheet.create({
  confirmBtn: {
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
  disabledConfirmBtn: {
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
