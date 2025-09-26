// src/screens/Home/Home.tsx
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { listQuestions } from "../../services/forum";
import { getDailyTip } from "../../services/tips";
import colors from "../../styles/colors";

type SortKey = "recent" | "popular";

type Question = {
  qid: string;
  title: string;
  body: string;
  author_name: string;
  child_age_label: string;
  likes: number;
  reply_count: number;
};

export default function Home({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  const [rows, setRows] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("popular");
  const [query, setQuery] = useState("");
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [dailyTip, setDailyTip] = useState<string>("");

  // Fetch questions from backend
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const backendSort = sort === "recent" ? "new" : sort;
        const data = await listQuestions({ limit: 3, sort: backendSort });
        setRows((data.items as any[]) || []);
      } catch (err) {
        console.error("Network error:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [sort]);

  // Mocked backend integration for daily tip
  useEffect(() => {
    (async () => {
      try {
        const tip = await getDailyTip();
        setDailyTip(tip.text);
      } catch (e) {
        setDailyTip("");
      }
    })();
  }, []);

  // Only show 2 items on home preview
  const visibleRows = useMemo(() => {
    if (!rows) return null;
    return rows.slice(0, 2);
  }, [rows]);

  const toggleLike = (qid: string) => {
    setRows((prev) =>
      prev
        ? prev.map((q) =>
            q.qid === qid
              ? { ...q, likes: likedMap[qid] ? q.likes - 1 : q.likes + 1 }
              : q
          )
        : prev
    );
    setLikedMap((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  const goSearch = () => {
    const q = query.trim();
    if (!q) return;
    navigation.navigate("SearchResults", { q });
  };

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
          {/* LEFT column */}
          <View style={{ flex: 1 }}>
            {/* Search bar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Enter keywords"
                returnKeyType="search"
                onSubmitEditing={goSearch}
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  paddingHorizontal: 16,
                  height: 40,
                }}
              />
              <Pressable
                onPress={goSearch}
                style={{
                  height: 40,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  backgroundColor: colors.aqua.normal,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                
                <Text style={{ fontWeight: "700", color: colors.aqua.text }}>
                  SEARCH
                </Text>
              </Pressable>
            </View>

            {/* Header row */}
            <View
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
            >
              <Text
                style={{ fontSize: 24, fontWeight: "800", color: colors.aqua.text }}
              >
                HOME FEED
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

            {visibleRows?.map((q) => (
              <View
                key={q.qid}
                style={{
                  backgroundColor: colors.aqua.light,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                {/* Question title */}
                <Pressable
                  onPress={() =>
                    navigation.navigate("QuestionDetail", { qid: q.qid })
                  }
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      marginBottom: 10,
                      color: colors.base.text,
                    }}
                  >
                    {q.title}
                  </Text>
                </Pressable>

                {/* Author row */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("ProfilePublic", { username: q.author_name })
                    }
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
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      navigation.navigate("ProfilePublic", { username: q.author_name })
                    }
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: colors.aqua.text,
                        textDecorationLine: "underline",
                      }}
                    >
                      {q.author_name}
                    </Text>
                  </Pressable>

                  <View
                    style={{
                      backgroundColor: colors.aqua.light,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginLeft: 6,
                    }}
                  >
                    <Text style={{ fontWeight: "700", color: colors.aqua.text }}>
                      {q.child_age_label}
                    </Text>
                  </View>

                  <View style={{ marginLeft: "auto", flexDirection: "row", gap: 16 }}>
                    <Text style={{ color: colors.base.text }}>
                      💬 {q.reply_count}
                    </Text>
                    <Pressable
                      onPress={() => toggleLike(q.qid)}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {likedMap[q.qid] ? "❤️" : "🤍"}
                      </Text>
                      <Text style={{ fontSize: 16, marginLeft: 6 }}>{q.likes}</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Body */}
                <Text
                  style={{ marginTop: 10, lineHeight: 20, color: colors.base.text }}
                >
                  {q.body}
                </Text>

                {/* Replies button */}
                <Pressable
                  onPress={() =>
                    navigation.navigate("QuestionDetail", { qid: q.qid })
                  }
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
            {/* Daily tip from mock service */}
            {dailyTip ? (
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: colors.peach.light,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.base.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>💡</Text>
                  <Text
                    style={{ fontSize: 18, fontWeight: "800", color: colors.peach.text }}
                  >
                    DAILY TIP
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    lineHeight: 22,
                    marginBottom: 10,
                    color: colors.peach.subtext,
                  }}
                >
                  {dailyTip}
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("Bibi")}
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: colors.peach.dark,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>Ask Bibi</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* RIGHT column */}
          <View style={{ width: isWide ? 280 : "100%", gap: 12 }}>
            <View
              style={{
                backgroundColor: colors.peach.light,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.base.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: colors.peach.text,
                }}
              >
                ACTIVE BREAKROOMS
              </Text>
              

              {/* Breakrooms list will be populated from backend (Agora) later */}

              <Pressable
                onPress={() => navigation.navigate("Bibi")}
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                  backgroundColor: colors.peach.dark,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>Ask Bibi</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}