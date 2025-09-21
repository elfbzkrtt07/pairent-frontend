// src/screens/Forums/Forums.tsx
import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions,
} from "react-native";
import { fetchAuthSession } from "aws-amplify/auth";

type Reply = {
  rid: string;
  author: string;
  body: string;
  likes: number;
  reply_count: number; // nested comments (if any)
};

type Thread = {
  qid: string;
  title: string;
  body: string;
  author_name: string;
  child_age_label: string;
  likes: number;
  reply_count: number;
  replies_preview: Reply[]; // first 2–3 replies
};

export default function Forums({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [myQuestions, setMyQuestions] = useState<Thread[]>([]);

  useEffect(() => {
  const loadThreads = async () => {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      // 1. All forum questions (main column)
      const allRes = await fetch("http://localhost:5000/questions?limit=10&sort=new", {
        method: "GET",
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
      });

      // 2. User’s own top 3 questions (sidebar)
      const myRes = await fetch("http://localhost:5000/questions/me?limit=3&sort=popular", {
        method: "GET",
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
      });

      const allData = await allRes.json();
      const myData = await myRes.json();

      setThreads(allData.items || []);
      setMyQuestions(myData.items || []);
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  loadThreads();
}, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ flex: 1, position: "relative" }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View
            style={{
              flexDirection: isWide ? "row" : "column",
              gap: 16,
              alignItems: "flex-start",
              maxWidth: 1200,
              alignSelf: "center",
              width: "100%",
            }}
          >
            {/* LEFT: threads list */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 24, fontWeight: "800" }}>FORUMS</Text>
                <Pressable
                  onPress={() => navigation.navigate("NewQuestion")}
                  style={{
                    marginLeft: "auto", width: 36, height: 36, borderRadius: 18,
                    backgroundColor: "#111827", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 22, marginTop: -2 }}>＋</Text>
                </Pressable>
              </View>

              {loading && (
                <View style={{ paddingVertical: 24 }}>
                  <ActivityIndicator size="large" />
                </View>
              )}

              {threads?.map((t) => (
                <View
                  key={t.qid}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  {/* Title */}
                  <Pressable onPress={() => navigation.navigate("QuestionDetail", { qid: t.qid })}>
                    <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 10 }}>
                      {t.title}
                    </Text>
                  </Pressable>

                  {/* Original poster row */}
                  <Pressable
                    onPress={() =>
                      navigation.navigate("ProfilePublic", {
                        username: t.author_name,
                      })
                    }
                    style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <View
                      style={{
                        width: 32, height: 32, borderRadius: 16,
                        backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Text>👤</Text>
                    </View>
                    <Text style={{ fontWeight: "700" }}>{t.author_name}</Text>
                    <View
                      style={{
                        backgroundColor: "#eef2ff", borderRadius: 999,
                        paddingHorizontal: 10, paddingVertical: 4, marginLeft: 6,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>{t.child_age_label}</Text>
                    </View>

                    <View style={{ marginLeft: "auto", flexDirection: "row", gap: 16 }}>
                      <Text>💬 {t.reply_count}</Text>
                      <Text>🤍 {t.likes}</Text>
                    </View>
                  </Pressable>

                  {/* Body */}
                  <Text style={{ marginTop: 10, lineHeight: 20, color: "#111827" }}>
                    {t.body}
                  </Text>

                  {/* View all replies */}
                  <Pressable
                    onPress={() => navigation.navigate("QuestionDetail", { qid: t.qid })}
                    style={{
                      marginTop: 14, alignSelf: "flex-start",
                      backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "800" }}>View all replies</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {/* RIGHT: your questions + Ask Bibi */}
            <View style={{ width: isWide ? 320 : "100%" }}>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  padding: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "800" }}>YOUR QUESTIONS</Text>
                </View>
                
                {myQuestions.length === 0 ? (
                <Text style={{ marginTop: 12, color: "#6b7280" }}>
                    You haven’t asked any questions yet.
                </Text>
                ) : (
                myQuestions.map((q) => (
                    <Pressable
                    key={q.qid}
                    onPress={() => navigation.navigate("QuestionDetail", { qid: q.qid })}
                    style={{
                        marginTop: 10,
                        backgroundColor: "#f3f4f6",
                        borderRadius: 12,
                        padding: 12,
                    }}
                    >
                    <Text style={{ fontWeight: "700", marginBottom: 6 }}>{q.title}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View
                        style={{
                            backgroundColor: "#e5e7eb",
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                        }}
                        >
                        <Text style={{ fontWeight: "700" }}>{q.child_age_label}</Text>
                        </View>
                        <Text style={{ color: "#6b7280" }}>💬 {q.reply_count}</Text>
                        <Text style={{ color: "#6b7280" }}>🤍 {q.likes}</Text>
                    </View>
                    </Pressable>
                ))
                )}
                <Pressable style={{ marginLeft: "auto" }} onPress={() => navigation.navigate("MyQuestions")}>
                  <Text style={{ color: "#4f46e5", fontWeight: "700" }}>See all</Text>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("Bibi")}
                  style={{
                    marginTop: 16,
                    alignSelf: "flex-start",
                    backgroundColor: "#4f46e5",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "800" }}>Ask Bibi</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}