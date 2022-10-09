import { useState, useEffect } from "react";
import { FlatList, View, SafeAreaView } from "react-native";
import { db, auth } from "../../../firebaseConfig";
import { SearchBar } from "react-native-elements";
import { MaterialIcons } from "@expo/vector-icons";
import {
  query,
  collection,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import AddFriendListItem from "../../../components/AddFriendListItem/AddFriendListItem";
import styles from "../../authscreens/AddContactScreen/AddContactScreenStyle";

const AddContactScreen = () => {
  const [search, setSearch] = useState("");
  const [usersSearchResult, setUsersSearchResult] = useState([]);
  const [usersFiltered, setUsersFiltered] = useState([]);
  const [friends, setFriends] = useState([]);

  const user = auth.currentUser;
  const usersCollRef = collection(db, "users");
  const q = query(
    usersCollRef,
    where("displayName", "!=", user.displayName),
    orderBy("displayName")
  );

  useEffect(() => {
    const unsubUsers = onSnapshot(q, (querySnapshot) => {
      setUsersSearchResult(
        querySnapshot.docs.map((doc) => {
          return { ...doc.data() };
        })
      );
    });

    return unsubUsers;
  }, []);

  useEffect(() => {
    const friendsRef = collection(db, "users", user.uid, "friends");
    const unsubFriends = onSnapshot(friendsRef, (querySnapshot) => {
      setFriends(
        querySnapshot.docs.map((doc) => {
          return { ...doc.data() };
        })
      );
    });

    return unsubFriends;
  }, []);

  const searchFilterFunction = (text) => {
    if (text) {
      const newData = usersSearchResult.filter((item) => {
        const itemData = item.displayName
          ? item.displayName.toLowerCase()
          : "".toLowerCase();
        const textData = text.toLowerCase();
        return itemData.indexOf(textData) > -1;
      });
      setUsersFiltered(newData);
      setSearch(text);
    } else {
      setUsersFiltered("");
      setSearch(text);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        placeholder="Search Users..."
        value={search}
        onChangeText={(text) => searchFilterFunction(text)}
        containerStyle={{
          backgroundColor: "transparent",
          borderBottomWidth: 0,
        }}
        inputContainerStyle={{ backgroundColor: "#ececec" }}
        inputStyle={{ color: "#000" }}
        round
        lightTheme
      />
      <FlatList
        ItemSeparatorComponent={() => (
          <View style={styles.ItemSeparatorComponent} />
        )}
        data={usersFiltered}
        renderItem={({ item }) => (
          <AddFriendListItem user={item} currentFriends={friends} />
        )}
        keyExtractor={(item) => item.userId}
        ListEmptyComponent={() => (
          <View style={styles.iconView}>
            <MaterialIcons name="person-search" size={60} color="#bdc3c7" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default AddContactScreen;
