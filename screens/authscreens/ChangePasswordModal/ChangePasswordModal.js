import { Text, TextInput, View, Pressable, Modal } from "react-native";

import { useState } from "react";
import { auth } from "../../../firebaseConfig";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useToast } from "react-native-toast-notifications";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../../components/CustomButton";
import useTheme from "../../../hooks/useTheme";
import styles from "../../authscreens/ChangePasswordModal/ChangePasswordModalStyle";

const ChangePasswordModal = ({
  passwordModalVisible,
  setPasswordModalVisible,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatePasswordSpinner, setUpdatePasswordSpinner] = useState(false);
  const [updatePasswordDisabled, setUpdatePasswordDisabled] = useState(false);

  const user = auth.currentUser;
  const toast = useToast();
  const { theme } = useTheme();

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.show("Please enter all required information", {
        type: "danger",
      });
    } else {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      reauthenticateWithCredential(user, credential)
        .then(() => {
          if (newPassword === confirmNewPassword) {
            setUpdatePasswordSpinner(true);
            setUpdatePasswordDisabled(true);

            updatePassword(user, newPassword)
              .then(() => {
                toast.show("Successfully updated password", {
                  type: "success",
                });
                setUpdatePasswordSpinner(false);
                setUpdatePasswordDisabled(false);
                setPasswordModalVisible(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
              })
              .catch((error) => {
                setUpdatePasswordSpinner(false);
                setUpdatePasswordDisabled(false);
                toast.show(error.message, {
                  type: "danger",
                });
                console.error(
                  error.code,
                  "-- error updating password --",
                  error.message
                );
              });
          } else {
            toast.show("Password confirm does not match new password", {
              type: "danger",
            });
          }
        })
        .catch((error) => {
          toast.show(error.message, {
            type: "danger",
          });
          console.error(
            error.code,
            "-- current password is incorrect --",
            error.message
          );
        });
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="formSheet"
      visible={passwordModalVisible}
      onRequestClose={() => {
        setPasswordModalVisible(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }}
    >
      <View
        style={{ flexDirection: "row", backgroundColor: theme.backgroundColor }}
      >
        <Pressable
          onPress={() => {
            setPasswordModalVisible(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
          }}
        >
          <View style={{ justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={32} color={theme.chevronback} />
          </View>
        </Pressable>
        <View style={styles.headerTextView}>
          <Text style={styles.headerText}>Change Password</Text>
        </View>
      </View>
      <View
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <View style={styles.inputView}>
          <View style={styles.textView}>
            <Text style={styles.fontSize}>Current Password:</Text>
          </View>
          <TextInput
            value={currentPassword}
            placeholder="Current Password..."
            placeholderTextColor="#bbb"
            onChangeText={(text) => setCurrentPassword(text)}
            style={styles.textInput}
            secureTextEntry
          />
        </View>
        <View style={styles.inputView}>
          <View style={styles.textView}>
            <Text style={styles.fontSize}>New Password:</Text>
          </View>
          <TextInput
            value={newPassword}
            placeholder="New Password..."
            placeholderTextColor="#bbb"
            onChangeText={(text) => setNewPassword(text)}
            style={styles.textInput}
            secureTextEntry
          />
        </View>
        <View style={styles.inputView}>
          <View style={styles.textView}>
            <Text style={styles.fontSize}>C.New Password:</Text>
          </View>
          <TextInput
            value={confirmNewPassword}
            placeholder="Confirm New Password..."
            placeholderTextColor="#bbb"
            onChangeText={(text) => setConfirmNewPassword(text)}
            style={styles.textInput}
            secureTextEntry
          />
        </View>

        <View style={{ alignItems: "center" }}>
          <CustomButton
            title={"Change Password"}
            onPress={handleChangePassword}
            loading={updatePasswordSpinner}
            disabled={updatePasswordDisabled}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ChangePasswordModal;
