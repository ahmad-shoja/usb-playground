import React, { useEffect } from "react";
import { View, Button } from "react-native";

export const Buttons = () => {
  useEffect(() => {
    console.log("test button re rendered");
  }, []);
  return (
    <View>
      <Button title="test" />
      <Button title="stop test" />
    </View>
  );
};
