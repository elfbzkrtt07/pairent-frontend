import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";

// ---- helpers ----
const pad2 = (n: number) => String(n).padStart(2, "0");
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate(); // m = 1..12

// build ranges
const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => CURRENT_YEAR - i); // current year back 120
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12

export default function Register({ navigation }: any) {
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  // default DOB: 2007-01-01 (as before)
  const [year, setYear] = useState(2007);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  // clamp day if month/year change (e.g., Feb → 28/29)
  useEffect(() => {
    const dim = daysInMonth(year, month);
    if (day > dim) setDay(dim);
  }, [year, month]);

  const DAYS = useMemo(
    () => Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
    [year, month]
  );

  const dobStr = useMemo(() => `${year}-${pad2(month)}-${pad2(day)}`, [year, month, day]);

  const [err, setErr] = useState("");

  const inputStyle = {
    borderWidth: 1 as const,
    padding: 12,
    borderRadius: 8,
    height: 48,
  };

  const pickerShell = {
    ...inputStyle,
    // make Picker look like TextInput:
    justifyContent: "center" as const,
  };

  const onSubmit = async () => {
    setErr("");
    try {
      await signUp(email.trim(), pwd, name.trim(), dobStr); // pass normalized DOB
      navigation.navigate("ConfirmSignUp", { email: email.trim() });
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
        <View style={{ flex: 1, padding: 20, gap: 12, justifyContent: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>
            Register
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            style={inputStyle}
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            style={inputStyle}
          />

          <TextInput
            value={pwd}
            onChangeText={setPwd}
            placeholder="Password"
            secureTextEntry
            style={inputStyle}
          />

          {/* DOB: Year / Month / Day — all same height/width style */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={[pickerShell, { flex: 1 }]}>
              <Picker
                selectedValue={year}
                onValueChange={(v) => setYear(v)}
                dropdownIconColor="#111827"
                style={{ height: 48 }}
              >
                {YEARS.map((y) => (
                  <Picker.Item key={y} label={String(y)} value={y} />
                ))}
              </Picker>
            </View>

            <View style={[pickerShell, { flex: 1 }]}>
              <Picker
                selectedValue={month}
                onValueChange={(v) => setMonth(v)}
                dropdownIconColor="#111827"
                style={{ height: 48 }}
              >
                {MONTHS.map((m) => (
                  <Picker.Item key={m} label={pad2(m)} value={m} />
                ))}
              </Picker>
            </View>

            <View style={[pickerShell, { flex: 1 }]}>
              <Picker
                selectedValue={day}
                onValueChange={(v) => setDay(v)}
                dropdownIconColor="#111827"
                style={{ height: 48 }}
              >
                {DAYS.map((d) => (
                  <Picker.Item key={d} label={pad2(d)} value={d} />
                ))}
              </Picker>
            </View>
          </View>

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
              Already have an account? <Text style={{ color: "blue" }}>Login</Text>
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
