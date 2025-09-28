import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import colors from "../../styles/colors";

export default function CreateBreakroom({ navigation }: any) {
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      Alert.alert("Missing name", "Please enter a breakroom name.");
      return;
    }

    try {
      setLoading(true);
      console.log("Creating breakroom:", { roomName, description });

      // TODO: Replace with backend call to create breakroom
      Alert.alert("Success", `Breakroom "${roomName}" created!`);

      // Simulate waiting before going back
      setTimeout(() => {
        setLoading(false);
        navigation.goBack();
      }, 1500);
    } catch (err) {
      console.error("Network error:", err);
      Alert.alert("Error", "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.base.background, padding: 16 }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          marginBottom: 20,
          color: colors.aqua.text,
        }}
      >
        CREATE BREAKROOM
      </Text>

      {/* Breakroom Name */}
      <TextInput
        value={roomName}
        onChangeText={setRoomName}
        placeholder="Enter breakroom name"
        placeholderTextColor={colors.base.text}
        style={{
          backgroundColor: colors.aqua.light,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.base.border,
          color: colors.base.text,
        }}
      />

      {/* Description */}
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Add description"
        placeholderTextColor={colors.base.text}
        multiline
        style={{
          backgroundColor: colors.aqua.light,
          borderRadius: 8,
          padding: 12,
          height: 120,
          textAlignVertical: "top",
          borderWidth: 1,
          borderColor: colors.base.border,
          color: colors.base.text,
        }}
      />

      {/* Submit Button */}
      <Pressable
        onPress={handleCreate}
        disabled={loading}
        style={{
          backgroundColor: loading ? colors.base.muted : colors.aqua.dark,
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 20,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Create Breakroom
          </Text>
        )}
      </Pressable>
    </View>
  );
}
