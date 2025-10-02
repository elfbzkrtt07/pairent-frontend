import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  listQuestions,
  listMyQuestions,
  likeQuestion,
} from "../../services/forum";
import colors from "../../styles/colors";

type Reply = {
  rid: string;
  author: string;
  body: string;
  likes: number;
  reply_count: number;
};

type Thread = {
  qid: string;
  title: string;
  body: string;
  author_name: string;
  child_age_label: string;
  likes: number;
  reply_count: number;
  replies_preview: Reply[];
};

type SortKey = "recent" | "popular";

export default function Forums({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [myQuestions, setMyQuestions] = useState<Thread[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState<SortKey>("popular");

  useEffect(() => {
    const loadThreads = async () => {
      try {
        setLoading(true);
        const backendSort = sort === "recent" ? "new" : sort;

        const [allData, myData] = await Promise.all([
          listQuestions({ limit: 10, sort: backendSort }),
          listMyQuestions({ limit: 3, sort: "popular" }),
        ]);

        setThreads((allData.items as any[]) || []);
        setMyQuestions((myData.items as any[]) || []);
      } catch (err) {
        console.error("Network error:", err);
        setThreads([]);
        setMyQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, [sort]);

  const toggleLike = async (qid: string) => {
    const next = !(likedMap[qid] ?? false);

    // Optimistic update
    setLikedMap((prev) => ({ ...prev, [qid]: next }));
    setThreads((prev) =>
      prev
        ? prev.map((t) =>
            t.qid === qid
              ? { ...t, likes: next ? t.likes + 1 : t.likes - 1 }
              : t
          )
        : prev
    );

    try {
      // Call backend
      const updatedLikes = await likeQuestion(qid, next);

      // Sync likes with backend
      setThreads((prev) =>
        prev
          ? prev.map((t) =>
              t.qid === qid ? { ...t, likes: updatedLikes } : t
            )
          : prev
      );
    } catch (err) {
      console.error("Like failed:", err);

      // Rollback if failed
      setLikedMap((prev) => ({ ...prev, [qid]: !next }));
      setThreads((prev) =>
        prev
          ? prev.map((t) =>
              t.qid === qid
                ? { ...t, likes: next ? t.likes - 1 : t.likes + 1 }
                : t
            )
          : prev
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.base.background }}>
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 24, fontWeight: "800", color: colors.aqua.text }}
                >
                  FORUMS
                </Text>

                {/* 🔽 Dropdown for sort */}
                <View
                  style={{
                    marginLeft: 12,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.base.border,
                    backgroundColor: "#fff",
                    paddingHorizontal: 4,
                    minWidth: 140,
                    justifyContent: "center",
                    height: 36,
                  }}
                >
                  <Picker
                    selectedValue={sort}
                    onValueChange={(v) => setSort(v as SortKey)}
                    style={{ height: 36, color: colors.base.text }}
                    dropdownIconColor={colors.base.text}
                  >
                    <Picker.Item label="Popular" value="popular" />
                    <Picker.Item label="Recent" value="recent" />
                  </Picker>
                </View>

                <Pressable
                  onPress={() => navigation.navigate("NewQuestion")}
                  style={{
                    marginLeft: "auto",
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.aqua.normal,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: colors.aqua.text, fontSize: 22, marginTop: -2 }}>
                    ＋
                  </Text>
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
                    backgroundColor: colors.aqua.light,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.base.border,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  {/* Title */}
                  <Pressable
                    onPress={() => navigation.navigate("QuestionDetail", { qid: t.qid })}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        marginBottom: 10,
                        color: colors.base.text,
                      }}
                    >
                      {t.title}
                    </Text>
                  </Pressable>

                  {/* Author row */}
                  <Pressable
                    onPress={() =>
                      navigation.navigate("ProfilePublic", { username: t.author_name })
                    }
                    style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.aqua.light,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text>👤</Text>
                    </View>
                    <Text style={{ fontWeight: "700", color: colors.base.text }}>
                      {t.author_name}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.peach.light,
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginLeft: 6,
                      }}
                    >
                      <Text style={{ fontWeight: "700", color: colors.peach.text }}>
                        {t.child_age_label}
                      </Text>
                    </View>

                    <View style={{ marginLeft: "auto", flexDirection: "row", gap: 16 }}>
                      <Pressable
                        onPress={() =>
                          navigation.navigate("QuestionDetail", { qid: t.qid })
                        }
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            color: colors.base.text,
                            fontSize: 16,
                            marginLeft: 6,
                          }}
                        >
                          💬 {t.reply_count}
                        </Text>
                      </Pressable>
                      {/* 👍 Like button */}
                      <Pressable
                        onPress={() => toggleLike(t.qid)}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={{ fontSize: 16 }}>
                          {likedMap[t.qid] ? "❤️" : "🤍"}
                        </Text>
                        <Text style={{ fontSize: 16, marginLeft: 6 }}>{t.likes}</Text>
                      </Pressable>
                    </View>
                  </Pressable>

                  {/* Body */}
                  <Text style={{ marginTop: 10, lineHeight: 20, color: colors.base.text }}>
                    {t.body}
                  </Text>

                  {/* Replies button */}
                  <Pressable
                    onPress={() => navigation.navigate("QuestionDetail", { qid: t.qid })}
                    style={{
                      marginTop: 14,
                      alignSelf: "flex-start",
                      backgroundColor: colors.aqua.normal,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: colors.aqua.text, fontWeight: "800" }}>
                      View all replies
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {/* RIGHT: sidebar */}
            <View style={{ width: isWide ? 320 : "100%" }}>
              <View
                style={{
                  backgroundColor: colors.peach.light,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  padding: 16,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: colors.peach.text }}
                >
                  YOUR QUESTIONS
                </Text>

                {myQuestions.length === 0 ? (
                  <Text style={{ marginTop: 12, color: colors.peach.subtext }}>
                    You haven’t asked any questions yet.
                  </Text>
                ) : (
                  myQuestions.map((q) => (
                    <Pressable
                      key={q.qid}
                      onPress={() =>
                        navigation.navigate("QuestionDetail", { qid: q.qid })
                      }
                      style={{
                        marginTop: 10,
                        backgroundColor: colors.peach.normal,
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          marginBottom: 6,
                          color: colors.base.text,
                        }}
                      >
                        {q.title}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                      >
                        <View
                          style={{
                            backgroundColor: colors.peach.normal,
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: colors.peach.text }}>
                            {q.child_age_label}
                          </Text>
                        </View>
                        <Text style={{ color: colors.base.text }}>
                          💬 {q.reply_count}
                        </Text>
                        <Text style={{ color: colors.base.text }}>🤍 {q.likes}</Text>
                      </View>
                    </Pressable>
                  ))
                )}

                <Pressable
                  style={{ marginLeft: "auto" }}
                  onPress={() => navigation.navigate("MyQuestions")}
                >
                  <Text style={{ color: colors.peach.dark, fontWeight: "700" }}>
                    See all
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("Bibi")}
                  style={{
                    marginTop: 16,
                    alignSelf: "flex-start",
                    backgroundColor: colors.peach.dark,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "800" }}>Ask BiBi</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
