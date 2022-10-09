import { View, Text } from "react-native";
import React from "react";
import { Button } from "react-native-elements";
import useTheme from "../hooks/useTheme";

const CustomButton = ({ onPress, title, loading, disabled, type }) => {
  const { theme } = useTheme();
  return (
    <Button
      title={title}
      titleStyle={{ fontSize: 24 }}
      onPress={onPress}
      buttonStyle={{ backgroundColor: theme.buttoncolor }}
      containerStyle={{ width: 200, marginVertical: 15 }}
      loading={loading}
      disabled={disabled}
      disabledStyle={{ backgroundColor: "#b2bec3" }}
      raised={true}
      type={type}
    />
  );
};

export default CustomButton;
