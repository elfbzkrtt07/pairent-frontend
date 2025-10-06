// src/screens/Profile/ProfilePublic.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { getPublicUser } from "../../services/profile";
import { listQuestionsByUser } from "../../services/forum";
import colors from "../../styles/colors";

type PublicChild = { id: string; name: string; dob?: string; age_label?: string };
type PublicUser = {
  id: string;
  name?: string;
  username?: string;
  bio?: string;
  email?: string; // <-- add email
  dob?: string;   // <-- add dob
  children?: PublicChild[];
  privacy?: Record<string, "public" | "friends" | "private">;
};

type Question = {
  qid: string;
  title: string;
  child_age_label: string;
  reply_count: number;
  likes: number;
  // Add these if your backend provides them:
  // created_at?: string;
  // body?: string;
};

export default function ProfilePublic({ route, navigation }: any) {
  const { userId } = route.params || {};

  // If userId is missing, show an error and do not render the rest
  if (!userId) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.base.background }}>
        <Text style={{ color: colors.base.text, fontSize: 18 }}>Invalid user profile link.</Text>
      </View>
    );
  }

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const userData = await getPublicUser(userId);
        setProfile(userData);

        // Always fetch questions by this user (regardless of privacy)
        const qData = await listQuestionsByUser(userId, {
          limit: 10, // Show more than 3 for a full list
          sort: "recent",
        });
        setQuestions(Array.isArray(qData?.items) ? qData.items : []);
      } catch (err) {
        console.error("Failed to fetch public profile:", err);
        setProfile(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.base.background }}>
        <ActivityIndicator size="large" color={colors.aqua.dark} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.base.background }}>
        <Text style={{ color: colors.base.text, fontSize: 18 }}>User not found.</Text>
      </View>
    );
  }

  // check privacy flags (backend ensures correct visibility, but we double-check)
  const canSeeChildren = profile.privacy?.children === "public";
  const canSeeBio = profile.privacy?.bio !== "private";
  const canSeeQuestions = profile.privacy?.forum !== "private";

  return (
    <View style={{ flex: 1, backgroundColor: colors.base.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* ---------- Header ---------- */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.base.border,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.aqua.light,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 42, color: colors.aqua.text }}>
                {profile.name?.[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: "800" }}>
                {profile.name && profile.name.trim() !== "" ? profile.name : "Anonymous"}
              </Text>
              {profile.username && (
                <Text style={{ color: colors.base.muted }}>
                  @{profile.username}
                </Text>
              )}
              {/* Show email if present */}
              {profile.email && (
                <Text style={{ color: colors.base.text, marginTop: 2 }}>
                  {profile.email}
                </Text>
              )}
              {/* Show date of birth if present */}
              {profile.dob && (
                <Text style={{ color: colors.base.text, marginTop: 2 }}>
                  {profile.dob}
                </Text>
              )}
              {canSeeBio && (
                <Text style={{ marginTop: 6, color: colors.base.text }}>
                  {profile.bio && profile.bio.trim() !== "" ? profile.bio : "No bio yet"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ---------- All Questions by User ---------- */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.base.border,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 8 }}>
            All Questions by {profile?.name || "this user"}
          </Text>
          {questions.length > 0 ? (
            questions.map((q) => (
              <Pressable
                key={q.qid}
                onPress={() =>
                  navigation.navigate("QuestionDetail", { qid: q.qid })
                }
                style={{
                  backgroundColor: colors.aqua.light,
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 10,
                }}
              >
                <Text style={{ fontWeight: "800", color: colors.aqua.text }}>
                  {q.title}
                </Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <Text style={{ color: colors.base.muted }}>
                    👶 {q.child_age_label}
                  </Text>
                  <Text style={{ color: colors.base.muted }}>
                    💬 {q.reply_count}
                  </Text>
                  <Text style={{ color: colors.base.muted }}>
                    🤍 {q.likes}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={{ marginTop: 8, color: colors.base.muted }}>
              No questions yet.
            </Text>
          )}
        </View>

        {/* ---------- Children ---------- */}
        {canSeeChildren && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.base.border,
              padding: 16,
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "800", marginBottom: 10 }}
            >
              Children
            </Text>

            {profile.children?.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {profile.children.map((c) => (
                  <View
                    key={c.id}
                    style={{
                      width: 160,
                      backgroundColor: colors.base.background,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.base.border,
                      padding: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>👶</Text>
                    <Text style={{ fontWeight: "700", marginTop: 4 }}>
                      {c.name}
                    </Text>
                    {c.age_label && (
                      <Text style={{ color: colors.base.muted, fontSize: 13 }}>
                        {c.age_label}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.base.muted }}>No children</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
