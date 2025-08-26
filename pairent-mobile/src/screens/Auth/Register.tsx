import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function Register({ navigation }: any) {
  const { signUp, signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [dob, setDob] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async () => {
    setErr("");
    try {
      await signUp(email.trim(), pwd, name.trim(), dob.trim());
      await signIn(email.trim(), pwd);
      navigation.navigate("Home");
    } catch (e: any) {
      setErr(e.message ?? "Registration failed");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding" })}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, padding: 20, gap: 12, justifyContent: "center" }}
        >
          <Text
            style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}
          >
            Register
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
          />

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

          <TextInput
            value={dob}
            onChangeText={setDob}
            placeholder="Date of Birth (YYYY-MM-DD)"
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
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white" }}>Create account</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={{ textAlign: "center", marginTop: 20, paddingBottom: 20 }}>
              Already have an account?{" "}
              <Text style={{ color: "blue" }}>Login</Text>
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
