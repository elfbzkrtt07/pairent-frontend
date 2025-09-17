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
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import { Picker } from "@react-native-picker/picker";
import { fetchAuthSession } from "aws-amplify/auth";

type SortKey = "recent" | "popular" | "following";

export default function Home({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900; // breakpoint for 2 columns

  const [rows, setRows] = useState<ForumCardItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("popular");

  // NEW: search query
  const [query, setQuery] = useState("");

  // Mock data
  /*useEffect(() => {
    const t = setTimeout(() => {
      setRows([
        {
          qid: "1",
          title: "My baby wakes up at night, how can I make him sleep better?",
          author_name: "janedoe_87",
          child_age: 2,
          reply_count: 20,
          likes: 120,
        },
        {
          qid: "2",
          title: "What are these spots on my daughters arms",
          author_name: "karensmithh",
          child_age: 13,
          reply_count: 23,
          likes: 102,
          created_at: "20240620123149",
        },
        {
          qid: "3",
          title: "Potty training tips for a stubborn toddler?",
          author_name: "maria88",
          child_age: 13,
          reply_count: 44,
          likes: 80,
          created_at: "20240621182923",
        },
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);*/
    useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        const url = `http://localhost:5000/questions?limit=3&sort=${sort}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!res.ok) {
          console.error("Failed to load questions", res.status);
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("Questions from backend:", data);

        setRows(data.items || []);
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [sort]);

  // Apply sort + limit to 2 items for Home preview
  const visibleRows = useMemo(() => {
    if (!rows) return rows;
    return rows.slice(0, 2);
  }, [rows, sort]);

  // NEW: go to search results
  const goSearch = () => {
    const q = query.trim();
    if (!q) return;
    // Change "SearchResults" to your route name if different
    navigation.navigate("SearchResults", { q });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          {/* LEFT COLUMN */}
          <View style={{ flex: 1 }}>
            {/* NEW: Search bar */}
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
                  borderColor: "#e5e7eb",
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
                  backgroundColor: "#d1d5db",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "700" }}>SEARCH</Text>
              </Pressable>
            </View>

            {/* Forums header row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: "800" }}>FORUMS</Text>

              {/* Sort dropdown */}
              <View
                style={{
                  marginLeft: 12,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
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
                  style={{ height: 36, color: "#222" }}
                  dropdownIconColor="#222"
                >
                  <Picker.Item label="Popular" value="popular" />
                  <Picker.Item label="Recent" value="recent" />
                  <Picker.Item label="Following" value="following" />
                </Picker>
              </View>

              {/* + button */}
              <Pressable
                onPress={() => navigation.navigate("NewQuestion")}
                style={{
                  marginLeft: "auto",
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#111827",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 22, marginTop: -2 }}>
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
              <ForumCard
                key={q.qid}
                item={q}
                onPress={() =>
                  navigation.navigate("QuestionDetail", { qid: q.qid })
                }
                onReplyPress={() =>
                  navigation.navigate("QuestionDetail", { qid: q.qid })
                }
              />
            ))}

            {/* Random daily AI tips */}
            <View
              style={{
                marginTop: 16,
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: "#e5e7eb",
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
                <Text style={{ fontSize: 18, fontWeight: "800" }}>
                  RANDOM DAILY AI TIPS
                </Text>
              </View>
              <Text style={{ fontSize: 15, lineHeight: 22, marginBottom: 10 }}>
                “Children copy behaviours more than they follow instructions.
                Show patience, kindness, and curiosity in everyday life.”
              </Text>
              <Pressable
                onPress={() => navigation.navigate("Bibi")}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#111827",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>
                  Ask Bibi
                </Text>
              </Pressable>
            </View>
          </View>

          {/* RIGHT COLUMN */}
          <View style={{ width: isWide ? 280 : "100%", gap: 12 }}>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  marginBottom: 12,
                }}
              >
                ACTIVE BREAKROOMS
              </Text>

              {[
                { id: "r1", title: "Reading alone", activity: "4/10" },
                { id: "r2", title: "Coping with work", activity: "7/10" },
                { id: "r3", title: "Random Chat", activity: "8/10" },
                { id: "r4", title: "Single moms club", activity: "4/10" },
                { id: "r5", title: "...", activity: "2/10" },
              ].map((r) => (
                <View
                  key={r.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600" }}>
                      {r.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#6b7280" }}>
                      {r.activity}
                    </Text>
                  </View>
                  <Pressable
                    style={{
                      backgroundColor: "#111827",
                      borderRadius: 999,
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "700" }}>
                      join
                    </Text>
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={() => navigation.navigate("Bibi")}
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                  backgroundColor: "#4f46e5",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>
                  Ask Bibi
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
