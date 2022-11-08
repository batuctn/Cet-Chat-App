import React, { useState } from "react";
import { View } from "react-native";
import {
  Button,
  Paragraph,
  Dialog,
  Portal,
  Provider,
} from "react-native-paper";

const DiyalogComponent = ({ person, hideDialog, visible }) => {
  return (
    <Provider>
      <View>
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Do you want report {person}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                This message send CetChat.This person will not be notified.
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button onPress={hideDialog}>Report</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

export default DiyalogComponent;
