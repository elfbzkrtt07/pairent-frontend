// src/screens/BiBi/BiBi.tsx
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import colors from "../../styles/colors";

type Message = {
  id: string;
  from: "user" | "bot";
  text: string;
};

export default function Chatbot({ route, navigation }: any) {
  const preset: string | undefined = route.params?.preset;

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", from: "bot", text: "Hi, I’m BiBi! How can I help you today?" },
  ]);
  const [input, setInput] = useState(preset || "");

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      from: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 🔹 Simulate backend reply (replace with API call later)
    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now().toString(),
        from: "bot",
        text: `I can't reply now since backend is not implemented yet. You said: "${trimmed}"`,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.base.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header with Go Back */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          borderBottomWidth: 1,
          borderColor: colors.base.border,
          backgroundColor: "#fff",
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: colors.peach.dark,
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Go Back</Text>
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "800",
            color: colors.base.text,
          }}
        >
          BiBi
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {messages.map((m) => (
          <View
            key={m.id}
            style={{
              alignSelf: m.from === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                m.from === "user" ? colors.aqua.normal : colors.peach.light,
              borderRadius: 12,
              padding: 12,
              marginBottom: 8,
              maxWidth: "75%",
            }}
          >
            <Text
              style={{
                color: m.from === "user" ? colors.aqua.text : colors.base.text,
              }}
            >
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input row */}
      <View
        style={{
          flexDirection: "row",
          padding: 12,
          borderTopWidth: 1,
          borderColor: colors.base.border,
          backgroundColor: "#fff",
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.base.border,
            borderRadius: 20,
            paddingHorizontal: 16,
            height: 40,
            marginRight: 8,
          }}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <Pressable
          onPress={sendMessage}
          style={{
            backgroundColor: colors.peach.dark,
            borderRadius: 20,
            height: 40,
            width: 80,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
