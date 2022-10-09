import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  FlatList,
  TextInput,
} from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { Ionicons, AntDesign, FontAwesome, Feather } from "@expo/vector-icons";
import { auth, db, storage } from "../../firebaseConfig";
import { useToast } from "react-native-toast-notifications";
import { Button, ListItem, Avatar } from "react-native-elements";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { updateDoc, doc, onSnapshot } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import GroupChatMemberInfo from "../../components/GroupChatMemberInfo";
import CustomButton from "../../components/CustomButton";

const GroupChatInfoScreen = ({ route, navigation, navigation: { goBack } }) => {
  const [groupChatPhoto, setGroupChatPhoto] = useState("");
  const [groupChatName, setGroupChatName] = useState("");
  const [currentChatName, setCurrentChatName] = useState("");
  const [pickedPhoto, setPickedPhoto] = useState("");
  const [updateChatSpinner, setUpdateChatSpinner] = useState(false);
  const [updateChatDisabled, setUpdateChatDisabled] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const user = auth.currentUser;
  const toast = useToast();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Group Info",
      headerLeft: () => (
        <View style={{ alignSelf: "center" }}>
          <Pressable onPress={() => goBack()}>
            <Ionicons name="chevron-back" size={32} color="#9b59b6" />
          </Pressable>
        </View>
      ),
      headerRight: () => (
        <Button
          title="Save"
          onPress={handleUpdateGroupChatInfo}
          type="clear"
          loading={updateChatSpinner}
          disabled={updateChatDisabled}
          titleStyle={{ fontSize: 20, color: "#9b59b6" }}
        />
      ),
    });
  }, [
    navigation,
    route,
    groupChatName,
    groupChatPhoto,
    updateChatSpinner,
    updateChatDisabled,
  ]);

  useEffect(() => {
    const groupRef = doc(db, "groups", route.params.groupId);
    // const groupRef = doc(db, "groups", route.params.chatInfo?.groupId);

    const unsubChatDetails = onSnapshot(groupRef, (doc) => {
      // console.log(doc.data());
      setGroupChatPhoto(doc.data().groupPhotoUrl);
      setCurrentChatName(doc.data().groupName);
    });

    return unsubChatDetails;
  }, []);

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
      toast.show(error.message, {
        type: "danger",
      });
      console.error(
        error.code,
        "-- error selecting new profile pic --",
        error.message
      );
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

  const handleUpdateGroupPhoto = async () => {
    try {
      setUpdateChatSpinner(true);
      setUpdateChatDisabled(true);

      const fileName = pickedPhoto.replace(/^.*[\\\/]/, "");
      const imageRef = ref(storage, `users/${user.uid}/images/${fileName}`);

      // firebase storage only accepts array of bytes for image/file so we need to first fetch from
      // result.uri and then convert to bytes using .blob() function from firebase
      const img = await fetch(pickedPhoto);
      const bytes = await img.blob();
      await uploadBytes(imageRef, bytes).then(() => {
        getDownloadURL(imageRef).then(async (url) => {
          const groupRef = doc(db, "groups", route.params.groupId);
          // const groupRef = doc(db, "groups", route.params.chatInfo.groupId);
          await updateDoc(groupRef, {
            groupPhotoUrl: url,
          }).then(() => {
            setUpdateChatSpinner(false);
            setUpdateChatDisabled(false);
            setPickedPhoto("");
            toast.show("Successfully updated group chat picture", {
              type: "success",
            });
          });
        });
      });
    } catch (error) {
      setUpdateChatSpinner(false);
      setUpdateChatDisabled(false);
      console.error(
        error.code,
        "--- error updating group chat picture ---",
        error.message
      );
      toast.show(error.message, {
        type: "danger",
      });
    }
  };

  const handleUpdateGroupChatName = async () => {
    try {
      setUpdateChatSpinner(true);
      setUpdateChatDisabled(true);

      const groupRef = doc(db, "groups", route.params.groupId);
      await updateDoc(groupRef, {
        groupName: groupChatName,
      }).then(() => {
        setUpdateChatSpinner(false);
        setUpdateChatDisabled(false);
        setCanEdit(false);
        setGroupChatName("");
        toast.show("Successfully updated group chat name", {
          type: "success",
        });
      });
    } catch (error) {
      setUpdateChatSpinner(false);
      setUpdateChatDisabled(false);
      toast.show(error.message, {
        type: "danger",
      });
      console.error(
        error.code,
        "-- error updating display name --",
        error.message
      );
    }
  };

  const handleUpdateGroupChatInfo = () => {
    if ((!pickedPhoto && !groupChatName) || groupChatName === currentChatName) {
      toast.show("No changes to be saved", {
        type: "warning",
      });
    } else {
      if (pickedPhoto) {
        handleUpdateGroupPhoto();
      }
      if (groupChatName) {
        handleUpdateGroupChatName();
      }
    }
    // console.log("done updating group chat info");
  };

  return (
    <View style={styles.container}>
      {!groupChatPhoto && !pickedPhoto && (
        <View>
          <View
            style={{
              backgroundColor: "#bdc3c7",
              height: 150,
              width: 150,
              borderRadius: 75,
              alignSelf: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontSize: 125,
              }}
            >
              {route.params.friendDisplayName.length}
            </Text>
          </View>
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
        </View>
      )}

      {!!pickedPhoto ? (
        <View>
          <Avatar source={{ uri: pickedPhoto }} size={150} rounded />
          <Pressable onPress={() => setPickedPhoto("")}>
            <View style={styles.removeAddPhotoBtn}>
              <Ionicons
                name="remove-circle"
                size={34}
                color="tomato"
                style={{ bottom: 2 }}
              />
            </View>
          </Pressable>
        </View>
      ) : (
        !!groupChatPhoto && (
          <View>
            <Avatar source={{ uri: groupChatPhoto }} size={150} rounded />
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
          </View>
        )
      )}

      <View
        style={{ flexDirection: "row", width: "90%", justifyContent: "center" }}
      >
        <View style={{ justifyContent: "center", marginRight: 5 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Group Name: </Text>
        </View>
        <TextInput
          value={groupChatName}
          placeholder={
            currentChatName
              ? currentChatName
              : route.params.friendDisplayName.join(", ")
          }
          style={
            canEdit
              ? styles.chatNameInput
              : [styles.chatNameInput, { backgroundColor: "#ececec" }]
          }
          onChangeText={(text) => setGroupChatName(text)}
          editable={canEdit}
        />
        <Pressable
          onPress={() => setCanEdit(!canEdit)}
          style={{ alignSelf: "center", paddingLeft: 10 }}
        >
          <Feather name="edit-2" size={20} color="black" />
        </Pressable>
      </View>

      <Text
        style={{
          textAlign: "center",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Group Chat Members
      </Text>
      <View style={{ borderBottomWidth: 1, width: "100%" }} />
      <FlatList
        ItemSeparatorComponent={() => (
          <View
            style={{
              width: "100%",
              borderBottomColor: "#dfe6e9",
              borderBottomWidth: 1,
            }}
          />
        )}
        data={route.params.membersInfo}
        renderItem={({ item }) => <GroupChatMemberInfo friend={item} />}
        keyExtractor={(item) => item.userId}
        style={{
          width: "100%",
        }}
      />
      {/* <Button
        title="chat id"
        onPress={() =>
          console.log("checking group chat id:", route.params.groupId)
        }
      /> */}
      {/* <Button
        title="chat info"
        onPress={() =>
          console.log("checking group chat info:", route.params.chatInfo)
        }
      /> */}
    </View>
  );
};

export default GroupChatInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // backgroundColor: "#ececec",
    // justifyContent: "center",
    // justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
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
  chatNameInput: {
    width: "65%",
    borderBottomWidth: 1,
    marginVertical: 20,
    fontSize: 18,
    height: 30,
    padding: 5,
  },
});
