import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { resendSignUpCode } from "aws-amplify/auth";

export default function ConfirmSignUp({ route, navigation }: any) {
  const { confirmSignUp, signIn } = useAuth();
  const [email, setEmail] = useState(route?.params?.email ?? "");
  const [pwd, setPwd] = useState(route?.params?.pwd ?? ""); 
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onConfirm = async () => {
    setErr("");
    setMsg("");
    try {
      await confirmSignUp(email.trim(), code.trim());
      setMsg("Account confirmed.");

      if (pwd) {
        await signIn(email.trim(), pwd);
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login", params: { email: email.trim() } }],
        });
      }
    } catch (e: any) {
      setErr(e.message ?? "Confirmation failed");
    }
  };

  const onResend = async () => {
    setErr("");
    setMsg("");
    try {
      await resendSignUpCode({ username: email.trim() });
      setMsg("Verification code sent to your email.");
    } catch (e: any) {
      setErr(e.message ?? "Could not resend code");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding" })}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          padding: 20,
          gap: 12,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Confirm your account
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
        />

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          keyboardType="number-pad"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
        />

        {err ? <Text style={{ color: "crimson" }}>{err}</Text> : null}
        {msg ? <Text style={{ color: "green" }}>{msg}</Text> : null}

        <Pressable
          onPress={onConfirm}
          style={{
            backgroundColor: "#111827",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>Confirm</Text>
        </Pressable>

        <Pressable onPress={onResend}>
          <Text
            style={{
              textAlign: "center",
              marginTop: 12,
              color: "blue",
            }}
          >
            Resend verification code
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
