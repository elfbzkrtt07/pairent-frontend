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
import { listQuestions, Question } from "../../services/forum";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import colors from "../../styles/colors";

type SortKey = "recent" | "popular";

export default function Home({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  const [rows, setRows] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("popular");
  const [query, setQuery] = useState("");
  const [dailyTip, setDailyTip] = useState<string>("");

  // Fetch questions from backend
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const backendSort = sort === "recent" ? "new" : sort;
        const data = await listQuestions({ limit: 3, sort: backendSort });
        setRows(data.items || []);
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
        // @ts-ignore
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

            {/* Use ForumCard for each question */}
            {visibleRows?.map((q) => (
              <ForumCard
                key={q.qid}
                item={q as ForumCardItem}
                onPress={() => navigation.navigate("QuestionDetail", { qid: q.qid })}
                onReplyPress={() => navigation.navigate("QuestionDetail", { qid: q.qid })}
              />
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
                  onPress={() =>
                    navigation.navigate("BiBi", {
                      preset: "Hi BiBi, can you give me a parenting tip for today?",
                    })
                  }
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: colors.peach.dark,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>Ask BiBi</Text>
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
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
