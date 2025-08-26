import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../../context/AuthContext";  // ✅ use context

export default function Login({ navigation }: any) {
  const { signIn } = useAuth();   // ✅ now using context
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async () => {
    setErr("");
    try {
      await signIn(email.trim(), pwd);
      navigation.navigate("Home");  // ✅ only navigate if signIn succeeds
    } catch (e: any) {
      console.error("Login error:", e);
      setErr(e.message ?? "Login failed");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding" })}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 20, gap: 12, justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>Login</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
        />

        <TextInput
          value={pwd}
          onChangeText={setPwd}
          placeholder="Password"
          secureTextEntry
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
        />

        {err ? <Text style={{ color: "crimson" }}>{err}</Text> : null}

        <Pressable
          onPress={onSubmit}
          style={{
            backgroundColor: "#111827",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>Sign in</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={{ textAlign: "center", marginTop: 10, paddingBottom: 20 }}>
          Don’t have an account? <Text style={{ color: "blue" }}>Register</Text>
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
