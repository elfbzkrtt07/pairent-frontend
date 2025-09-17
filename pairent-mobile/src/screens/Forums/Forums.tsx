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

  // mock data for now
  /*
  useEffect(() => {
    const t = setTimeout(() => {
      setThreads([
        {
          qid: "q1",
          title: "My baby wakes up at night, how can I make him sleep better?",
          body:
            "He keeps waking up every 2-3 hours. We tried white noise and feeding before bed. Any advice?",
          author_name: "janedoe_87",
          child_age_label: "2 yrs",
          likes: 120,
          reply_count: 20,
          replies_preview: [
            {
              rid: "r1",
              author: "janetsmith",
              body:
                "My daughter did the same at that age. Consistent bedtime routine (bath, story, dim lights) helped.",
              likes: 12,
              reply_count: 3,
            },
            {
              rid: "r2",
              author: "georgejackson",
              body:
                "Could be teething or growth spurts. Try a comfort object and avoid picking up right away.",
              likes: 10,
              reply_count: 5,
            },
          ],
        },
        {
          qid: "q2",
          title: "What are these spots on my daughters arms",
          body:
            "Small red patches appeared this week. Non-itchy. Anyone seen this before?",
          author_name: "karensmithh",
          child_age_label: "13 yrs",
          likes: 102,
          reply_count: 23,
          replies_preview: [
            {
              rid: "r3",
              author: "maria88",
              body:
                "Looks like mild eczema from your description. Fragrance-free moisturizer helped us.",
              likes: 7,
              reply_count: 2,
            },
          ],
        },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);
  */
  useEffect(() => {
    const loadThreads = async () => {
      try {
        // 1. Get Cognito JWT token
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        // 2. Call backend API
        const res = await fetch("http://127.0.0.1:5000/questions?limit=10&sort=new", {
          method: "GET",
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          }
        });

        if (!res.ok) {
          console.error("❌ Failed to load questions", res.status);
          setLoading(false);
          return;
        }

        // 3. Parse response
        const data = await res.json();
        console.log("✅ Questions from API:", data);

        setThreads(data.items || []); // depends on your backend’s JSON shape
      } catch (err) {
        console.error("❌ Network error:", err);
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

                  {/* Replies preview */}
                  {/*
                  {t.replies_preview.map((r) => (
                    <View
                      key={r.rid}
                      style={{
                        marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f3f4f6",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View
                          style={{
                            width: 28, height: 28, borderRadius: 14,
                            backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Text>👤</Text>
                        </View>
                        <Text style={{ fontWeight: "700" }}>{r.author}</Text>
                        <View style={{ marginLeft: "auto", flexDirection: "row", gap: 14 }}>
                          <Text>💬 {r.reply_count}</Text>
                          <Text>🤍 {r.likes}</Text>
                        </View>
                      </View>
                      <Text style={{ marginTop: 6, lineHeight: 20, color: "#374151" }}>
                        {r.body}
                      </Text>
                    </View>
                  ))}
                  */}

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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "800" }}>YOUR QUESTIONS</Text>
                  <Pressable style={{ marginLeft: "auto" }} onPress={() => navigation.navigate("Home")}>
                    <Text style={{ color: "#4f46e5", fontWeight: "700" }}>See more</Text>
                  </Pressable>
                </View>

                {[
                  {
                    qid: "y1",
                    title:
                      "My 2-year-old refuses to eat vegetables, what can I do to encourage healthy eating?",
                    age: "2 yrs",
                    replies: 20,
                    likes: 110,
                  },
                  {
                    qid: "y2",
                    title:
                      "How can I help my 5-year-old manage tantrums when it’s time to leave the playground?",
                    age: "5 yrs",
                    replies: 67,
                    likes: 198,
                  },
                  {
                    qid: "y3",
                    title: "Is it normal for my 2-year-old not to speak in full sentences yet?",
                    age: "2 yrs",
                    replies: 46,
                    likes: 58,
                  },
                ].map((q) => (
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
                        <Text style={{ fontWeight: "700" }}>{q.age}</Text>
                      </View>
                      <Text style={{ color: "#6b7280" }}>💬 {q.replies}</Text>
                      <Text style={{ color: "#6b7280" }}>🤍 {q.likes}</Text>
                    </View>
                  </Pressable>
                ))}

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
