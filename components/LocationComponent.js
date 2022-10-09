import { View, StyleSheet, Pressable, Text } from "react-native";
import React, { useState } from "react";
import MapView from "react-native-maps";
import { Dimensions } from "react-native";
import { auth } from "../firebaseConfig";

const LocationComponent = ({ lat, long, senderUserId }) => {
  const [isActive, setIsActive] = useState(false);
  const user = auth.currentUser;

  return (
    <View style={user.uid === senderUserId ? styles.flexend : styles.flexstart}>
      <MapView
        initialRegion={{
          latitude: lat,
          longitude: long,
          latitudeDelta: 1.122,
          longitudeDelta: 1.2421,
        }}
        onPress={() => {
          setIsActive(true);
        }}
        style={isActive === true ? styles.map : styles.littleMap}
      >
        <MapView.Marker
          coordinate={{
            latitude: lat,
            longitude: long,
          }}
          title={"myTitle"}
          description={"myDescription"}
          pinColor={"#9b59b6"}
          onCalloutPress={() => setIsActive(false)}
        >
          <MapView.Callout>
            <View>
              <Text>Go Back!</Text>
            </View>
          </MapView.Callout>
        </MapView.Marker>
      </MapView>
    </View>
  );
};

export default LocationComponent;

const styles = StyleSheet.create({
  container: {},
  map: {
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
  },
  littleMap: {
    width: 150,
    height: 100,
  },
  flexend: {
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  flexstart: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
