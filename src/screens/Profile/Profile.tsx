// src/screens/Profile/Profile.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";
import { fetchAuthSession } from "aws-amplify/auth";

type Child = { name: string; age: number };
type Question = { qid: string; title: string; reply_count: number; likes: number };
type ExtendedUser = {
  bio?: string;
  children?: Child[];
  privacy?: Record<string, "public" | "private">;
};

export default function Profile({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const { user, signOut } = useAuth();
  const [extended, setExtended] = useState<ExtendedUser | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        const [profileRes, qRes] = await Promise.all([
          fetch("http://localhost:5000/users/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch("http://localhost:5000/questions/me?limit=5&sort=recent", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (profileRes.ok) setExtended(await profileRes.json());
        if (qRes.ok) {
          const data = await qRes.json();
          setQuestions(data.items || []);
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No user logged in.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const Card = ({ children, style }: { children: React.ReactNode; style?: object }) => (
    <View
      style={[
        {
          backgroundColor: "white",
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: "#e5e5e5",
          flex: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        backgroundColor: "#f3f4f6",
        gap: 16,
      }}
    >
      {/* Header row */}
<Card
  style={{
    flexDirection: isWide ? "row" : "column",
    alignItems: isWide ? "flex-start" : "center",
    gap: 24,
    padding: 24,        // more padding
    minHeight: 250,     // makes it slightly bigger
  }}
>
  {/* Left column: Avatar + name */}
  <View style={{ alignItems: isWide ? "center" : "flex-start", width: 220 }}>
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 40, fontWeight: "800", color: "#111827" }}>
        {user.name?.slice(0, 1).toUpperCase() ??
          user.email?.slice(0, 1).toUpperCase() ??
          "?"}
      </Text>
    </View>
    <Text style={{ fontSize: 18, fontWeight: "700" }}>
      {user.name ?? "Unnamed"}
    </Text>
    <Text style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>
      {user.email}
    </Text>

    {/* Buttons inside same card */}
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Pressable
        onPress={() => navigation.navigate("EditProfile")}
        style={{
          backgroundColor: "#111827",
          paddingVertical: 6,
          paddingHorizontal: 14,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Edit</Text>
      </Pressable>
      <Pressable
        onPress={async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
        style={{
          backgroundColor: "crimson",
          paddingVertical: 6,
          paddingHorizontal: 14,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Sign out</Text>
      </Pressable>
    </View>
  </View>

  {/* Right column: Profile info */}
  <View style={{ flex: 1, justifyContent: "center" }}>
    <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
      Profile Information
    </Text>
    <Text style={{ marginBottom: 4 }}>Name: {user.name ?? "—"}</Text>
    <Text style={{ marginBottom: 4 }}>Email: {user.email}</Text>
    <Text style={{ marginBottom: 4 }}>
      Birthdate: {user.birthdate ?? "—"}
    </Text>
    <Text>Bio: {extended?.bio ?? "—"}</Text>
  </View>
</Card>


      {/* Second row: Children + Privacy */}
      <View
        style={{
          flexDirection: isWide ? "row" : "column",
          gap: 16,
        }}
      >
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Children
          </Text>
          {extended?.children?.length ? (
            extended.children.map((c, i) => (
              <Text key={i} style={{ marginBottom: 4 }}>
                👶 {c.name}, {c.age} yrs
              </Text>
            ))
          ) : (
            <Text style={{ color: "#6b7280" }}>No children</Text>
          )}
        </Card>

        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Privacy Settings
          </Text>
          {["Full Name", "Email", "Date of Birth", "Children Names", "Children Ages", "Questions", "Likes", "Replies"].map(
            (field) => (
              <View
                key={field}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
              >
                <Text style={{ flex: 1 }}>{field}:</Text>
                <Picker
                  selectedValue={extended?.privacy?.[field.toLowerCase().replace(" ", "_")] ?? "public"}
                  onValueChange={(v) => console.log(`Update ${field} ->`, v)}
                  style={{ flex: 1, height: 30 }}
                >
                  <Picker.Item label="Public" value="public" />
                  <Picker.Item label="Private" value="private" />
                </Picker>
              </View>
            )
          )}
        </Card>
      </View>

      {/* Questions */}
<Card style={{ minHeight: 200 }}>
  {/* Header row */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: "700", flex: 1 }}>
      Your Questions
    </Text>

    {/* Buttons */}
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Pressable
        onPress={() => navigation.navigate("MyQuestions")} 
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 6,
          backgroundColor: "#f3f4f6",
        }}
      >
        <Text style={{ color: "#2563eb", fontWeight: "600" }}>See more</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("SavedForums")}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 6,
          backgroundColor: "#f3f4f6",
        }}
      >
        <Text style={{ color: "#111827", fontWeight: "600" }}>
          Saved Forums
        </Text>
      </Pressable>
    </View>
  </View>

  {/* List of questions */}
  {questions.length > 0 ? (
    questions.map((q) => (
      <Pressable
        key={q.qid}
        onPress={() =>
          navigation.navigate("QuestionDetail", { qid: q.qid })
        }
        style={{
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <Text style={{ fontWeight: "600" }}>{q.title}</Text>
        <Text style={{ color: "#6b7280", fontSize: 13 }}>
          💬 {q.reply_count} • 🤍 {q.likes}
        </Text>
      </Pressable>
    ))
  ) : (
    <Text style={{ color: "#6b7280" }}>No questions yet.</Text>
  )}
</Card>

    </ScrollView>
  );
}
