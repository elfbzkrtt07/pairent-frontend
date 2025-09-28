import React from "react";
import { View, Text } from "react-native";
import Breakroom from "../../components/Breakroom";

export default function Breakrooms() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 20, fontWeight: "bold" }}>
        🔊 Daily.co Breakroom Test
      </Text>
      {/* Pass in your Daily room URL */}
      <Breakroom url="https://pairent.daily.co/test_room_1" />
    </View>
  );
}
