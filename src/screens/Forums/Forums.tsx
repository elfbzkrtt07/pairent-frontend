// src/screens/Home/Forums.tsx
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
import { listQuestions, listMyQuestions } from "../../services/forum";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import colors from "../../styles/colors";

type SortKey = "recent" | "popular";

export default function Forums({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  const [threads, setThreads] = useState<ForumCardItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [myQuestions, setMyQuestions] = useState<ForumCardItem[]>([]);
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

        setThreads((allData.items as ForumCardItem[]) || []);
        setMyQuestions((myData.items as ForumCardItem[]) || []);
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.base.background }}>
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
              <ForumCard
                key={t.qid}
                item={t}
                onPress={() => navigation.navigate("QuestionDetail", { qid: t.qid })}
                onReplyPress={() =>
                  navigation.navigate("QuestionDetail", { qid: t.qid })
                }
                onAuthorPress={(username) =>
                  navigation.navigate("ProfilePublic", { username })
                }
              />
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
                style={{ marginLeft: "auto", marginTop: 8 }}
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
  );
}
