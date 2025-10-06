import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../../styles/colors";
import { createBreakroom } from "../../services/breakrooms";

export default function CreateBreakroom() {
  const navigation = useNavigation();
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Please enter a room name");
      return;
    }

    // ✅ Sanitize: only letters, numbers, -, _
    const safeName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");

    try {
      const res = await createBreakroom(safeName);
      Alert.alert("Room Created", `Join at: ${res.url}`);
      navigation.goBack();
    } catch (err) {
      console.error("Failed to create room", err);
      Alert.alert("Error", "Failed to create room");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.base.background }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          color: colors.peach.text,
          marginBottom: 20,
        }}
      >
        Create a Breakroom
      </Text>

      <TextInput
        placeholder="Room Name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: colors.base.border,
          padding: 10,
          borderRadius: 8,
          marginBottom: 20,
          backgroundColor: "white",
        }}
      />

      <Pressable
        onPress={handleCreate}
        style={{
          backgroundColor: colors.peach.dark,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>Create</Text>
      </Pressable>
    </View>
  );
}
