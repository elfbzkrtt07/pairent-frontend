// src/screens/Home/SearchResults.tsx
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import colors from "../../styles/colors";
import { searchQuestions } from "../../services/forum";

export default function SearchResults({ route, navigation }: any) {
  const { q } = route.params as { q: string };
  const [items, setItems] = useState<ForumCardItem[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setItems(null); // show spinner
        const data = await searchQuestions({ q }); // ✅ pass object, not string
        setItems(data.items || []);
      } catch (err) {
        console.error("Search failed:", err);
        setItems([]);
      }
    })();
  }, [q]);

  if (!items) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.base.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.peach.dark} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      style={{ backgroundColor: colors.base.background }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          marginBottom: 12,
          color: colors.peach.text,
        }}
      >
        {items.length} result{items.length !== 1 ? "s" : ""} found with “{q}”
      </Text>

      {items.map((item) => (
        <View
          key={item.qid}
          style={{
            backgroundColor: colors.peach.light,
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.base.border,
          }}
        >
          <ForumCard
            item={item}
            onPress={() =>
              navigation.navigate("QuestionDetail", { qid: item.qid })
            }
            onReplyPress={() =>
              navigation.navigate("QuestionDetail", { qid: item.qid })
            }
          />
        </View>
      ))}
    </ScrollView>
  );
}
