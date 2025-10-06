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
import { resendSignUpCode, fetchUserAttributes } from "aws-amplify/auth";
import { createProfile } from "../../services/profile";
import colors from "../../styles/colors";

export default function ConfirmSignUp({ route, navigation }: any) {
  const { confirmSignUp, signIn, signOut } = useAuth();
  const [email, setEmail] = useState(route?.params?.email ?? "");
  const [pwd, setPwd] = useState(route?.params?.pwd ?? "");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onConfirm = async () => {
    setErr("");
    setMsg("");
    try {
      // Step 1: Confirm Cognito user
      await confirmSignUp(email.trim(), code.trim());
      setMsg("Account confirmed.");

      // Step 2: Log in to obtain tokens
      await signIn(email.trim(), pwd);
      console.log("✅ Logged in successfully after confirmation");

      // Step 3: Fetch user attributes (includes 'sub')
      const attrs = await fetchUserAttributes();
      const userSub = attrs.sub;
      console.log("✅ Cognito sub:", userSub);

      // Step 4: Create backend profile (authenticated)
      await createProfile(
        userSub,
        email.split("@")[0], // name
        attrs.birthdate ?? "2000-01-01"
      );
      console.log("✅ Backend profile created");

      // Step 5: Log out and redirect to login
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login", params: { email: email.trim() } }],
      });
    } catch (e: any) {
      console.error("Confirm error:", e);
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
      style={{ flex: 1, backgroundColor: colors.base.background }}
    >
      <View style={{ flex: 1, padding: 20, gap: 12, justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>
          Confirm your account
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            borderWidth: 1,
            borderColor: colors.aqua.dark,
            backgroundColor: colors.aqua.light,
            padding: 12,
            borderRadius: 8,
          }}
        />

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          keyboardType="number-pad"
          style={{
            borderWidth: 1,
            borderColor: colors.peach.dark,
            backgroundColor: colors.peach.light,
            padding: 12,
            borderRadius: 8,
          }}
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
          <Text style={{ color: colors.base.background, fontWeight: "600" }}>
            Confirm
          </Text>
        </Pressable>

        <Pressable onPress={onResend}>
          <Text
            style={{
              textAlign: "center",
              marginTop: 12,
              color: "#111827",
              fontWeight: "500",
            }}
          >
            Resend verification code
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
