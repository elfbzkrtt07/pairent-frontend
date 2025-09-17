// Login.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function Login({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async () => {
    setErr("");
    try {
      await signIn(email.trim(), pwd);
      navigation.navigate("Home");
    } catch (e: any) {
      console.error("Login error:", e);
      setErr(e.message ?? "Login failed");
    }
  };

  const field = {
    borderWidth: 1 as const,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    color: "#222",
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            minHeight: "100%",
            paddingVertical: 24,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Card */}
          <View
            style={{
              width: "100%",
              maxWidth: 520,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 20,
              backgroundColor: "#fff",
              gap: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* App Icon */}
            <Image
              source={require("../../../assets/icon.png")}
              style={{
                width: Platform.OS === "web" ? 84 : 110,
                height: Platform.OS === "web" ? 84 : 110,
                marginBottom: 8,
                alignSelf: "center",
              }}
              resizeMode="contain"
            />

            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Login
            </Text>

            <Text style={{ color: "#222", fontWeight: "500" }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              autoCapitalize="none"
              style={[field]}
            />

            <Text style={{ color: "#222", fontWeight: "500" }}>Password</Text>
            <TextInput
              value={pwd}
              onChangeText={setPwd}
              placeholder="Enter your password"
              secureTextEntry
              style={[field]}
            />

            {err ? <Text style={{ color: "crimson", marginTop: 4 }}>{err}</Text> : null}

            <Pressable
              onPress={onSubmit}
              style={{
                backgroundColor: "#222",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Login</Text>
            </Pressable>
          </View>

          <View style={{ height: 16 }} />

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={{ textAlign: "center", color: "#222" }}>
              Don’t have an account? <Text style={{ color: "blue" }}>Register</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
