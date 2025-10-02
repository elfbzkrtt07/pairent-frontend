// src/screens/Home/EditQuestion.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { getQuestion, editQuestion } from "../../services/forum";
import colors from "../../styles/colors";

export default function EditQuestion({ route, navigation }: any) {
  const { qid } = route.params as { qid: string };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = await getQuestion(qid);
        setTitle(q.title || "");
        setDescription(q.body || "");
        // join tags array into a comma-separated string for input
        if ((q as any).tags) {
          setTags((q as any).tags.join(", "));
        }
      } catch (err) {
        console.error("Failed to load question:", err);
        Alert.alert("Error", "Unable to load question details.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [qid]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a question title.");
      return;
    }

    try {
      await editQuestion(qid, {
        title,
        body: description,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      });

      Alert.alert("Success", "Your question has been updated!");
      navigation.goBack();
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Something went wrong while updating.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.aqua.dark} />
      </View>
    );
  }

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
        EDIT QUESTION
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
          marginBottom: 16,
          borderRadius: 8,
          padding: 12,
          height: 120,
          textAlignVertical: "top",
          borderWidth: 1,
          borderColor: colors.base.border,
          color: colors.base.text,
        }}
      />

      <TextInput
        value={tags}
        onChangeText={setTags}
        placeholder="Comma-separated tags (e.g. sleep, feeding)"
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

      <Pressable
        onPress={handleUpdate}
        style={{
          backgroundColor: colors.aqua.dark,
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          Save Changes
        </Text>
      </Pressable>
    </View>
  );
}
