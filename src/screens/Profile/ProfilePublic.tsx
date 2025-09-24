// src/screens/Profile/ProfilePublic.tsx
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";

type Child = { id: string; name: string; age: number };
type Question = { qid: string; title: string; child_age_label: string; reply_count: number; likes: number };
type PublicUser = {
  name: string;
  username: string;
  bio?: string;
  children?: Child[];
};

export default function ProfilePublic({ route, navigation }: any) {
  const { userId } = route.params || {};
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        /* not yet implemented in backend*/
        const userRes = await fetch(`http://localhost:5000/users/${userId}`);
        const qRes = await fetch(`http://localhost:5000/questions/by-user/${userId}?limit=3&sort=popular`);

        if (userRes.ok) setProfile(await userRes.json());
        if (qRes.ok) {
          const data = await qRes.json();
          setQuestions(data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch public profile", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#e5e7eb",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 52 }}>
                {profile.name?.slice(0, 1).toUpperCase() ?? "?"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: "800" }}>
                {profile.name}
              </Text>
              <Text style={{ color: "#6b7280", marginBottom: 8 }}>
                @{profile.username}
              </Text>
              <Text style={{ color: "#374151" }}>
                {profile.bio ?? "No bio yet"}
              </Text>
            </View>
          </View>
        </View>

        {/* Questions */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800" }}>Questions</Text>
            <Pressable
              style={{ marginLeft: "auto" }}
              onPress={() => navigation.navigate("UserQuestions", { userId })}
            >
              <Text style={{ color: "#4f46e5", fontWeight: "700" }}>
                See more
              </Text>
            </Pressable>
          </View>

          {questions.length > 0 ? (
            questions.map((q) => (
              <Pressable
                key={q.qid}
                onPress={() =>
                  navigation.navigate("QuestionDetail", { qid: q.qid })
                }
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: 12,
                  padding: 12,
                  marginTop: 10,
                }}
              >
                <Text style={{ fontWeight: "800", marginBottom: 6 }}>
                  {q.title}
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View
                    style={{
                      backgroundColor: "#e5e7eb",
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>
                      {q.child_age_label}
                    </Text>
                  </View>
                  <Text style={{ color: "#6b7280" }}>💬 {q.reply_count}</Text>
                  <Text style={{ color: "#6b7280" }}>🤍 {q.likes}</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={{ marginTop: 8, color: "#6b7280" }}>
              No questions yet.
            </Text>
          )}
        </View>

        {/* Children */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 10 }}>
            Children
          </Text>
          <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
            {profile.children?.length ? (
              profile.children.map((c) => (
                <View
                  key={c.id}
                  style={{
                    width: 260,
                    backgroundColor: "#f9fafb",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: "#e5e7eb",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 30 }}>👶</Text>
                  </View>
                  <Text style={{ fontWeight: "800" }}>{c.name}</Text>
                  <Text style={{ color: "#6b7280" }}>Age: {c.age}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#6b7280" }}>No children</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
