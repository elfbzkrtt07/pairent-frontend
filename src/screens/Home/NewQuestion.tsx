// src/screens/Home/NewQuestion.tsx
import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { createQuestion } from "../../services/forum";
import colors from "../../styles/colors";

export default function NewQuestion({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a question title.");
      return;
    }

    try {
      const data = await createQuestion({
        title,
        body: description,
        tags: [],
        age: 2,
      });
      console.log("Saved question:", data);

      Alert.alert("Success", "Your question has been posted!");
      navigation.goBack();
    } catch (err) {
      console.error("Network error:", err);
      Alert.alert("Error", "Something went wrong.");
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
        New Question
      </Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter your question"
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

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Add details"
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

      <Pressable
        onPress={handleSubmit}
        style={{
          backgroundColor: colors.aqua.dark,
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          Submit Question
        </Text>
      </Pressable>
    </View>
  );
}
