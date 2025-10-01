// src/screens/Auth/Register.tsx
import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import colors from "../../styles/colors";

const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export default function Register({ navigation }: any) {
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [dob, setDob] = useState(new Date(2007, 0, 1));
  const [showPicker, setShowPicker] = useState(false);
  const [err, setErr] = useState("");

  const { minDate, maxDate, minDateStr, maxDateStr } = useMemo(() => {
    const CURRENT_YEAR = new Date().getFullYear();
    const min = new Date(CURRENT_YEAR - 120, 0, 1);
    const max = new Date();
    return {
      minDate: min,
      maxDate: max,
      minDateStr: toYMD(min),
      maxDateStr: toYMD(max),
    };
  }, []);

  const dobStr = useMemo(() => toYMD(dob), [dob]);

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && selected) setDob(selected);
      setShowPicker(false);
      return;
    }
    if (selected) setDob(selected);
  };

  const onSubmit = async () => {
    setErr("");
    try {
      // 1. Cognito signup
      await signUp(email.trim(), pwd, name.trim(), dobStr);

      // 2. Send to backend
      // Commented out for now since we get CORS errors on backend
      /*const res = await fetch("http://localhost:5000/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          dob: dobStr,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save user to backend");
      }*/

      // 3. Navigate to confirm page
      navigation.navigate("ConfirmSignUp", { email: email.trim() });
    } catch (e: any) {
      console.error("Registration error:", e);
      setErr(e?.message ?? "Registration failed");
    }
  };

  const field = {
    borderWidth: 1 as const,
    borderColor: colors.base.border,
    padding: 12,
    borderRadius: 6,
    backgroundColor: colors.base.background,
    color: colors.base.text,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.aqua.light }}
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
              borderColor: colors.base.border,
              borderRadius: 12,
              padding: 20,
              backgroundColor: colors.base.background,
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
                color: colors.base.text,
              }}
            >
              Register
            </Text>

            <Text style={{ color: colors.base.text, fontWeight: "500" }}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={[field]}
            />

            <Text style={{ color: colors.base.text, fontWeight: "500" }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              style={[field]}
            />

            <Text style={{ color: colors.base.text, fontWeight: "500" }}>Password</Text>
            <TextInput
              value={pwd}
              onChangeText={setPwd}
              placeholder="Enter your password"
              secureTextEntry
              style={[field]}
            />

            <Text style={{ color: colors.base.text, fontWeight: "500" }}>Date of Birth</Text>

            {Platform.OS === "web" ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  borderRadius: 6,
                  backgroundColor: colors.base.background,
                  height: 44,
                  justifyContent: "center",
                  paddingHorizontal: 8,
                }}
              >
                {/* @ts-ignore: raw DOM element for web */}
                <input
                  type="date"
                  value={dobStr}
                  min={minDateStr}
                  max={maxDateStr}
                  onChange={(e: any) => {
                    const [yy, mm, dd] = e.target.value
                      .split("-")
                      .map((s: string) => parseInt(s, 10));
                    if (yy && mm && dd) setDob(new Date(yy, mm - 1, dd));
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 15,
                    lineHeight: 1,
                    padding: 0,
                    fontFamily: "Bahnschrift, Arial, sans-serif",
                    color: colors.base.text,
                  }}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowPicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.base.border,
                    borderRadius: 6,
                    backgroundColor: colors.base.background,
                    paddingHorizontal: 12,
                    height: 44,
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: colors.base.text }}>{dobStr}</Text>
                </TouchableOpacity>

                {Platform.OS === "android" && showPicker && (
                  <DateTimePicker
                    value={dob}
                    mode="date"
                    display="calendar"
                    maximumDate={maxDate}
                    minimumDate={minDate}
                    onChange={handleDateChange}
                  />
                )}

                {Platform.OS === "ios" && (
                  <Modal visible={showPicker} transparent animationType="slide">
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "flex-end",
                        backgroundColor: "rgba(0,0,0,0.3)",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: colors.base.background,
                          padding: 12,
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <Pressable onPress={() => setShowPicker(false)}>
                            <Text style={{ color: "crimson", fontWeight: "600" }}>Cancel</Text>
                          </Pressable>
                          <Pressable onPress={() => setShowPicker(false)}>
                            <Text style={{ color: colors.base.text, fontWeight: "700" }}>Done</Text>
                          </Pressable>
                        </View>

                        <DateTimePicker
                          value={dob}
                          mode="date"
                          display="spinner"
                          maximumDate={maxDate}
                          minimumDate={minDate}
                          onChange={handleDateChange}
                          style={{ backgroundColor: colors.base.background }}
                        />
                      </View>
                    </View>
                  </Modal>
                )}
              </>
            )}

            {err ? <Text style={{ color: "crimson", marginTop: 4 }}>{err}</Text> : null}

            <Pressable
              onPress={onSubmit}
              style={{
                backgroundColor: colors.peach.dark,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: colors.base.background, fontWeight: "600" }}>
                Create Account
              </Text>
            </Pressable>
          </View>

          <View style={{ height: 16 }} />

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={{ textAlign: "center", color: colors.base.text }}>
              Already have an account?{" "}
              <Text style={{ color: colors.aqua.dark }}>Login</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
