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
import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import {
  collection,
  setDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, storage, db } from "../../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import {
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
  FontAwesome,
  Feather,
} from "@expo/vector-icons";
import { Avatar, Button } from "react-native-elements";
import { useToast } from "react-native-toast-notifications";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import CustomButton from "../../components/CustomButton";

const SignUpScreen = ({ navigation: { goBack } }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayNameAvailable, setDisplayNameAvailable] = useState(true);
  const [pickedPhoto, setPickedPhoto] = useState("");
  const [signingUpSpinner, setSigningUpSpinner] = useState(false);
  const [signUpDisabled, setSignUpDisabled] = useState(false);

  const toast = useToast();

  const usersRef = collection(db, "users");
  const qDisplayName = query(usersRef, where("displayName", "==", displayName));

  useEffect(() => {
    const unsubDisplayNames = onSnapshot(qDisplayName, (querySnapshot) => {
      let userDisplayNames = [];
      querySnapshot.docs.forEach((doc) => {
        userDisplayNames.push(doc.data().displayName);
      });

      if (userDisplayNames.length > 0) {
        setDisplayNameAvailable(false);
      } else {
        setDisplayNameAvailable(true);
      }
    });

    return unsubDisplayNames;
  }, [displayName]);

  const selectProfilePic = async () => {
    try {
      // Ask the user for the permission to access the media library
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
      toast.show(error.message, { type: "danger" });
      console.error(error.code, "--- line 109 ----", error.message);
    }
  };

  // This function is triggered when the "Open camera" button pressed
  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      toast.show("Camera permissions are currently denied", {
        type: "danger",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    // Explore the result
    // console.log(result);

    if (!result.cancelled) {
      setPickedPhoto(result.uri);
      // console.log(result.uri);
    }
  };

  const addUserToCollection = async (user) => {
    try {
      const userRef = doc(db, `users/${user.uid}`);
      await setDoc(userRef, {
        email: user.email,
        photoURL: user.photoURL,
        displayName: user.displayName,
        userId: user.uid,
      });
    } catch (error) {
      console.error(
        error.code,
        "--- trouble adding user to collection ---",
        error.message
      );
      toast.show(error.message, { type: "danger" });
    }
  };

  const signUpWithProfilePic = async (user) => {
    const fileName = pickedPhoto.replace(/^.*[\\\/]/, "");
    const imageRef = ref(storage, `users/${user.uid}/images/${fileName}`);

    // firebase storage only accepts array of bytes for image/file so we need to first fetch from
    // result.uri and then convert to bytes using .blob() function from firebase
    const img = await fetch(pickedPhoto);
    const bytes = await img.blob();
    await uploadBytes(imageRef, bytes).then(() => {
      getDownloadURL(imageRef)
        .then((url) => {
          // console.log(url);
          updateProfile(user, {
            photoURL: url,
            displayName: displayName,
          }).then(() => {
            addUserToCollection(user);
          });
        })
        .catch((error) => {
          console.error(
            error.code,
            "--- trouble signing up with profile pic ---",
            error.message
          );
          toast.show(error.message, { type: "danger" });
        });
    });
  };

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      toast.show("Please enter email, password, and display name", {
        type: "warning",
        placement: "top",
      });
    } else if (password !== confirmPassword) {
      toast.show("Passwords do not match", {
        type: "warning",
        placement: "top",
      });
    } else {
      setSigningUpSpinner(true);
      setSignUpDisabled(true);
      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          if (!pickedPhoto) {
            const defaultImageRef = ref(
              storage,
              "defaultUserImage/default-user-icon.jpeg"
            );
            getDownloadURL(defaultImageRef)
              .then((url) => {
                updateProfile(user, {
                  photoURL: url,
                  displayName: displayName,
                }).then(() => {
                  addUserToCollection(user);
                });
              })
              .catch((error) => {
                console.error(
                  error.code,
                  "---- error getting download url from storage ----",
                  error.message
                );
              });
          } else {
            signUpWithProfilePic(user);
          }
          toast.show("Welcome to Chat!", {
            text: "success",
          });
        })
        .catch((error) => {
          setSigningUpSpinner(true);
          setSignUpDisabled(true);
          console.error(
            error.code,
            "--- trouble creating user ---",
            error.message
          );
          toast.show(error.message, { type: "danger" });
        });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <View>
          <Pressable onPress={() => goBack()} style={{ flexDirection: "row" }}>
            <Ionicons name="ios-chevron-back" size={28} color="black" />
            <Text
              style={{
                fontSize: 20,
                alignSelf: "center",
              }}
            >
              Login
            </Text>
          </Pressable>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.userInfoInputView}
      >
        <Pressable onPress={selectProfilePic}>
          {!pickedPhoto ? (
            <>
              <Avatar
                source={require("../../assets/default-user-icon.jpeg")}
                size={150}
                rounded
              />
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
                    // onSelect={() => alert(`Opening camera`)}
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
              <View style={styles.removeAddPhotoBtn}>
                <Pressable onPress={() => setPickedPhoto("")}>
                  <Ionicons
                    name="remove-circle"
                    size={34}
                    color="tomato"
                    style={{ bottom: 2 }}
                  />
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
        <View style={{ alignItems: "center", width: "100%" }}>
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
              style={{ width: "100%", fontSize: 18 }}
            />
          </View>
          <View style={styles.credentialInput}>
            <AntDesign
              name="user"
              size={24}
              color="lightgrey"
              style={{ marginRight: 5 }}
            />
            <TextInput
              placeholder="Display Name"
              value={displayName}
              onChangeText={(text) => setDisplayName(text)}
              style={{ width: "100%", fontSize: 18 }}
            />
          </View>
          {!displayNameAvailable && (
            <Text style={{ color: "#e84118", fontSize: 14 }}>
              Display Name Is Not Available
            </Text>
          )}
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
              style={{ width: "100%", fontSize: 18 }}
              secureTextEntry
            />
          </View>
          <View style={styles.credentialInput}>
            {password !== confirmPassword ? (
              <AntDesign
                name="close"
                size={24}
                color="#e84118"
                style={{ marginRight: 5 }}
              />
            ) : (
              <AntDesign
                name="check"
                size={24}
                color="green"
                style={{ marginRight: 5 }}
              />
            )}
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              style={{ width: "100%", fontSize: 18 }}
              editable={true}
              secureTextEntry
            />
          </View>
          {password !== confirmPassword && (
            <Text style={{ color: "#e84118", fontSize: 14 }}>
              Passwords do not match
            </Text>
          )}

          <CustomButton
            title={"Sign Up"}
            onPress={handleSignUp}
            loading={signingUpSpinner}
            disabled={signUpDisabled}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    textAlign: "center",
    justifyContent: "center",
  },
  userInfoInputView: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  removeAddPhotoBtn: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "#fff",
    // backgroundColor: "red",
  },
  credentialInput: {
    flexDirection: "row",
    width: "80%",
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    marginVertical: 10,
    padding: 3,
  },
  pwNotConfirmed: {
    flexDirection: "row",
    width: "80%",
    borderColor: "#e84118",
    borderBottomColor: "#000",
    borderWidth: 1,
    marginVertical: 10,
    padding: 3,
  },
  signUpBtn: {
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
  disabledSignUpBtn: {
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
