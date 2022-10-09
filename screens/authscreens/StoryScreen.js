import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

const StoryScreen = ({ route, navigation }) => {
  const { friendPhotoURL } = route.params;
  const { friendDisplayName } = route.params;
  const { StoryUrl } = route.params;

  useEffect(() => {
    let timer = setTimeout(() => {
      navigation.goBack();
    }, 10000);

    Animated.timing(progress, {
      toValue: 5,
      duration: 10000,
      useNativeDriver: false,
    }).start();
    return () => clearTimeout(timer);
  }, []);

  const [progress, setProgress] = useState(new Animated.Value(0));

  const progressAnimation = progress.interpolate({
    inputRange: [0, 5],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.body}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View style={styles.storyStick}>
        <Animated.View
          style={{
            height: "100%",
            backgroundColor: "white",
            width: progressAnimation,
          }}
        ></Animated.View>
      </View>
      <View style={styles.header}>
        <View style={styles.storyLittleİmage}>
          <Image
            source={{
              uri: friendPhotoURL,
            }}
            style={styles.storyImage}
          />
        </View>
        <View style={styles.storyUsername}>
          <Text style={styles.nameText}>{friendDisplayName}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" style={styles.closed} />
          </TouchableOpacity>
        </View>
      </View>
      <Image
        source={{
          uri: StoryUrl,
        }}
        style={styles.imagePossiton}
      />
    </View>
  );
};

export default StoryScreen;

const styles = StyleSheet.create({
  body: {
    backgroundColor: "black",
    height: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  storyStick: {
    height: 3,
    width: "100%",
    borderWidth: 1,
    backgroundColor: "gray",
    position: "absolute",
    top: 30,
  },
  header: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 30,
    left: 0,
    width: "87%",
    height: "10%",
  },
  storyLittleİmage: {
    width: 50,
    height: 50,
  },
  storyImage: {
    borderRadius: 100,

    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  storyUsername: {
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
  },
  nameText: {
    color: "white",
    fontSize: 15,
    paddingLeft: 10,
  },
  closed: {
    fontSize: 20,
    color: "white",
    opacity: 0.6,
  },
  imagePossiton: {
    position: "absolute",
    width: "100%",
    height: "75%",
    top: 100,
  },
});
