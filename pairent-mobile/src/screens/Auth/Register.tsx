// Register.tsx
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
      await signUp(email.trim(), pwd, name.trim(), dobStr);
      navigation.navigate("ConfirmSignUp", { email: email.trim() });
    } catch (e: any) {
      setErr(e?.message ?? "Registration failed");
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
      // Avoid extra space on web; keep iOS nice with padding
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            // Center when there's room; allow scroll when not
            minHeight: "100%",
            paddingVertical: 24,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Centered card, responsive width */}
          <View
            style={{
              width: "100%",
              maxWidth: 520,           // tighter than before to fit
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 20,             // a bit less padding to reduce height
              backgroundColor: "#fff",
              gap: 12,                 // tighter gaps
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

            <Text style={{ fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
              Register
            </Text>

            <Text style={{ color: "#222", fontWeight: "500" }}>Nickname</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your nickname"
              style={[field]}
            />

            <Text style={{ color: "#222", fontWeight: "500" }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
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

            <Text style={{ color: "#222", fontWeight: "500" }}>Date of Birth</Text>

            {Platform.OS === "web" ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  backgroundColor: "#fff",
                  height: 44,              // slightly shorter field
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
                    const [yy, mm, dd] = e.target.value.split("-").map((s: string) => parseInt(s, 10));
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
                    color: "#222",
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
                    borderColor: "#ccc",
                    borderRadius: 6,
                    backgroundColor: "#fff",
                    paddingHorizontal: 12,
                    height: 44,
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#222" }}>{dobStr}</Text>
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
                    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" }}>
                      <View
                        style={{
                          backgroundColor: "#fff",
                          padding: 12,
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }}
                      >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                          <Pressable onPress={() => setShowPicker(false)}>
                            <Text style={{ color: "crimson", fontWeight: "600" }}>Cancel</Text>
                          </Pressable>
                          <Pressable onPress={() => setShowPicker(false)}>
                            <Text style={{ color: "#111827", fontWeight: "700" }}>Done</Text>
                          </Pressable>
                        </View>

                        <DateTimePicker
                          value={dob}
                          mode="date"
                          display="spinner"
                          maximumDate={maxDate}
                          minimumDate={minDate}
                          onChange={handleDateChange}
                          style={{ backgroundColor: "#fff" }}
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
                backgroundColor: "#222",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Create Account</Text>
            </Pressable>
          </View>

          <View style={{ height: 16 }} />

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={{ textAlign: "center", color: "#222" }}>
              Already have an account? <Text style={{ color: "blue" }}>Login</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
