// src/screens/Home/NewQuestion.tsx
/*
import { View, Text } from "react-native";
export default function NewQuestion({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={{ padding: 16 }}><Text>New Question form (wire to backend later)</Text></View>
    </View>
  );
}
*/
import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { fetchAuthSession } from "aws-amplify/auth";

export default function NewQuestion({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a question title.");
      return;
    }

    try {
      // 1. Get Cognito JWT token
      const session = await fetchAuthSession();
      const idToken = session.tokens?.accessToken?.toString();

      // 2. Call backend
      const res = await fetch("http://localhost:5000/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken ? `Bearer ${idToken}` : "",
        },
        body: JSON.stringify({
          title: title,
          body: description,
          tags: [],
          age: 2
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Backend error:", err);
        Alert.alert("Error", "Could not save question");
        return;
      }

      // 3. Success
      const data = await res.json();
      console.log("✅ Saved question:", data);

      Alert.alert("Success", "Your question has been posted!");
      navigation.goBack();
    } catch (err) {
      console.error("❌ Network error:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 20 }}>
        New Question
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter your question"
        style={{ backgroundColor: "white", borderRadius: 8, padding: 12, marginBottom: 16 }}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Add details"
        multiline
        style={{ backgroundColor: "white", borderRadius: 8, padding: 12, height: 120, textAlignVertical: "top" }}
      />
    <Pressable
    onPress={handleSubmit}
    style={{
        backgroundColor: "#222",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20, // ✅ Added margin
    }}
    >
    <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
        Submit Question
    </Text>
    </Pressable>
    </View>
  );
}