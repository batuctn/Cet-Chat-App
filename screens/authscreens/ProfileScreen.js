import { useEffect, useState, useLayoutEffect } from "react";
import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import {
  collection,
  query,
  where,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../../firebaseConfig";
import { Avatar } from "react-native-elements";
import {
  Ionicons,
  Entypo,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";

import * as ImagePicker from "expo-image-picker";
import { useToast } from "react-native-toast-notifications";
import UpdateEmailModal from "./UpdateEmailModal";
import ChangePasswordModal from "./ChangePasswordModal/ChangePasswordModal";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import CustomButton from "../../components/CustomButton";

const ProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const toast = useToast();

  const { theme, toggleTheme } = useTheme();
  const [pickedPhoto, setPickedPhoto] = useState("");
  const [email, setEmail] = useState(user.email);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [emailVerified, setEmailVerified] = useState(user.emailVerified);
  const [displayNameAvailable, setDisplayNameAvailable] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [savingChangesSpinner, setSavingChangesSpinner] = useState(false);
  const [savingChangesDisabled, setSavingChangesDisabled] = useState(false);
  const [canEditEmail, setCanEditEmail] = useState(false);
  const [canEditDisplayName, setCanEditDisplayName] = useState(false);

  const usersRef = collection(db, "users");
  const qEmail = query(usersRef, where("email", "==", email));
  const qDisplayName = query(usersRef, where("displayName", "==", displayName));

  useEffect(() => {
    const unsubDisplayNames = onSnapshot(qDisplayName, (querySnapshot) => {
      let userDisplayNames = [];
      querySnapshot.docs.forEach((doc) => {
        if (doc.data().displayName !== user.displayName) {
          userDisplayNames.push(doc.data().displayName);
        }
      });

      if (userDisplayNames.length > 0) {
        setDisplayNameAvailable(false);
      } else {
        setDisplayNameAvailable(true);
      }
    });

    return unsubDisplayNames;
  }, [displayName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerLeft: () => (
        <Text style={{ fontSize: 36, fontWeight: "700", color: theme.color }}>
          Profile
        </Text>
      ),
      headerRight: () => (
        <MaterialCommunityIcons
          name="logout"
          onPress={() => signOut(auth)}
          size={32}
        />
      ),
    });
  }, [navigation, user.photoURL]);

  const selectProfilePic = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        toast.show(
          "You denied permission to allow this app to access your photos",
          {
            type: "danger",
          }
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        exif: false,
      });
      if (!result.cancelled) {
        setPickedPhoto(result.uri);
      }
    } catch (error) {
      toast.show("Trouble selecting profile pic", {
        type: "danger",
      });
      console.error(
        error.code,
        "-- error selecting new profile pic --",
        error.message
      );
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      toast.show("Camera permissions are currently denied", {
        type: "danger",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.cancelled) {
      setPickedPhoto(result.uri);
    }
  };

  const handleUpdateProfilePic = async () => {
    try {
      setSavingChangesSpinner(true);
      setSavingChangesDisabled(true);

      const fileName = pickedPhoto.replace(/^.*[\\\/]/, "");
      const imageRef = ref(storage, `users/${user.uid}/images/${fileName}`);
      const img = await fetch(pickedPhoto);
      const bytes = await img.blob();
      await uploadBytes(imageRef, bytes).then(() => {
        getDownloadURL(imageRef).then(async (url) => {
          await updateProfile(user, {
            photoURL: url,
          })
            .then(async () => {
              const userRef = doc(db, "users", user.uid);
              await updateDoc(userRef, {
                photoURL: url,
              });
            })
            .then(() => {
              setSavingChangesSpinner(false);
              setSavingChangesDisabled(false);
              setPickedPhoto("");
              toast.show("Successfully updated profile picture", {
                type: "success",
              });
              // console.log("Profile was updated succesfully");
            });
        });
      });
    } catch (error) {
      setSavingChangesSpinner(false);
      setSavingChangesDisabled(false);
      console.error(
        error.code,
        "--- error updating profile picture ---",
        error.message
      );
      toast.show("Error updating profile pricture", {
        type: "danger",
      });
    }
  };

  const handleUpdateDisplayName = async () => {
    try {
      setSavingChangesSpinner(true);
      setSavingChangesDisabled(true);

      await updateProfile(user, {
        displayName: displayName,
      })
        .then(async () => {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            displayName: displayName,
          });
        })
        .then(() => {
          setSavingChangesSpinner(false);
          setSavingChangesDisabled(false);
          toast.show("Successfully updated display name", {
            type: "success",
          });
        });
    } catch (error) {
      setSavingChangesSpinner(false);
      setSavingChangesDisabled(false);
      toast.show("Error updating display name", {
        type: "danger",
      });
      console.error(
        error.code,
        "-- error updating display name --",
        error.message
      );
    }
  };

  const handleUpdateProfile = () => {
    try {
      if (!email || !displayName) {
        toast.show("Please enter email and display name", {
          type: "danger",
        });
      } else if (
        email === user.email &&
        displayName === user.displayName &&
        !pickedPhoto
      ) {
        toast.show("No changes to be saved", {
          type: "warning",
        });
      } else if (!displayNameAvailable) {
        toast.show("Display Name is not available", {
          type: "danger",
        });
      } else {
        if (email !== user.email) {
          setModalVisible(true);
        }
        if (pickedPhoto) {
          handleUpdateProfilePic();
        }
        if (displayName !== user.displayName) {
          handleUpdateDisplayName();
        }
      }
    } catch (error) {
      toast.show("Trouble updating profile", {
        type: "danger",
      });
      console.error(error.code, "-- error updating profile --", error.message);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.settingsBodyView}>
        <View
          style={{
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          {!pickedPhoto ? (
            <>
              <Avatar source={{ uri: user.photoURL }} size={150} rounded />
              <Menu>
                <MenuTrigger>
                  <View style={styles.removeAddPhotoBtn}>
                    <Ionicons
                      name="add-circle"
                      size={34}
                      color="green"
                      style={{ bottom: 2 }}
                    />
                  </View>
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption
                    onSelect={selectProfilePic}
                    style={{ marginVertical: 5 }}
                  >
                    <View style={{ flexDirection: "row", paddingLeft: 5 }}>
                      <FontAwesome name="picture-o" size={20} color="#000" />
                      <View style={{ alignSelf: "center", marginLeft: 5 }}>
                        <Text style={{ fontSize: 18 }}>Select Photo</Text>
                      </View>
                    </View>
                  </MenuOption>
                  <MenuOption
                    style={{ marginVertical: 5 }}
                    onSelect={openCamera}
                  >
                    <View style={{ flexDirection: "row", paddingLeft: 5 }}>
                      <Feather name="camera" size={20} color="#000" />
                      <View style={{ alignSelf: "center", marginLeft: 5 }}>
                        <Text style={{ fontSize: 18 }}>Camera</Text>
                      </View>
                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </>
          ) : (
            <>
              <Avatar source={{ uri: pickedPhoto }} size={150} rounded />
              <Pressable onPress={() => setPickedPhoto("")}>
                <View style={styles.removeAddPhotoBtn}>
                  <Ionicons
                    name="remove-circle"
                    size={34}
                    color="tomato"
                    style={{ position: "relative", bottom: 2 }}
                  />
                </View>
              </Pressable>
            </>
          )}
        </View>
        <View style={{ alignItems: "center" }}>
          <MaterialCommunityIcons
            onPress={toggleTheme}
            name="theme-light-dark"
            size={30}
          />
        </View>

        <View
          style={{
            marginVertical: 20,
          }}
        >
          <View style={styles.credentialInputView}>
            <Text style={styles.credentialPropertyText}>Email:</Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <TextInput
                value={email}
                placeholder={user.email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
                style={
                  canEditEmail
                    ? styles.credentialInput
                    : [styles.credentialInput, { backgroundColor: "#ececec" }]
                }
                editable={canEditEmail}
              />
              {user.providerData[0].providerId === "password" ? (
                <Pressable
                  onPress={() => setCanEditEmail(!canEditEmail)}
                  style={{ alignSelf: "center", paddingLeft: 10 }}
                >
                  <Feather name="edit-2" size={20} color="black" />
                </Pressable>
              ) : (
                <View style={{ marginLeft: 30 }} />
              )}
              {/* </View> */}
            </View>
          </View>
          <View style={styles.credentialInputView}>
            <Text style={styles.credentialPropertyText}>Display Name:</Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <TextInput
                value={displayName}
                placeholder={user.displayName}
                onChangeText={(text) => setDisplayName(text)}
                style={
                  canEditDisplayName
                    ? styles.credentialInput
                    : [styles.credentialInput, { backgroundColor: "#ececec" }]
                }
                editable={canEditDisplayName}
              />
              <Pressable
                onPress={() => setCanEditDisplayName(!canEditDisplayName)}
                style={{ alignSelf: "center", paddingLeft: 10 }}
              >
                <Feather name="edit-2" size={20} color="black" />
              </Pressable>
            </View>
          </View>
          {!displayNameAvailable && (
            <View style={{ paddingRight: 10 }}>
              <Text
                style={{ color: "#e84118", fontSize: 14, textAlign: "right" }}
              >
                Display Name Is Not Available
              </Text>
            </View>
          )}
          <View style={styles.credentialInputView}>
            <Text style={styles.credentialPropertyText}>Email Verified: </Text>
            {emailVerified ? (
              <Text style={styles.credentialPropertyText}>Yes</Text>
            ) : (
              <Text style={styles.credentialPropertyText}>No</Text>
            )}
          </View>
        </View>
        {user.providerData[0].providerId === "password" && (
          <View
            style={{
              flexDirection: "row",
              alignSelf: "flex-end",
            }}
          >
            <View style={{ justifyContent: "center" }}>
              <Text
                onPress={() => setPasswordModalVisible(true)}
                style={{
                  paddingLeft: 10,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Change Password
              </Text>
              <ChangePasswordModal
                passwordModalVisible={passwordModalVisible}
                setPasswordModalVisible={setPasswordModalVisible}
              />
            </View>
            <Entypo name="chevron-small-right" size={24} color="black" />
          </View>
        )}
      </View>
      <View style={{ alignItems: "center" }}>
        <CustomButton
          title={"Save Changes"}
          onPress={handleUpdateProfile}
          loading={savingChangesSpinner}
          disabled={savingChangesDisabled}
        />

        <UpdateEmailModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          email={email}
          user={user}
        />
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  settingsBodyView: {},
  removeAddPhotoBtn: {
    position: "absolute",
    bottom: 5,
    right: -70,
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  credentialInputView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  credentialPropertyText: {
    fontSize: 18,
    alignSelf: "center",
  },
  credentialInput: {
    width: 200,
    height: 30,
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    fontSize: 18,
    padding: 5,
  },
  updateBtn: {
    backgroundColor: "#fff",
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
  disabledUpdateBtn: {
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
  signOutBtn: {
    backgroundColor: "#22a6b3",
    borderRadius: 10,
    width: 100,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "flex-end",
    elevation: 3,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "#333",
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
});
