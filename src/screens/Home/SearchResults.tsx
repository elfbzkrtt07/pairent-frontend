// src/screens/Home/SearchResults.tsx
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import colors from "../../styles/colors";

export default function SearchResults({ route, navigation }: any) {
  const { q } = route.params as { q: string };
  const [items, setItems] = useState<ForumCardItem[] | null>(null);

  // 🔹 Mock data for testing
  const mockResults: ForumCardItem[] = [
    {
      qid: "q1",
      title: "How do I get my toddler to eat veggies?",
      author_name: "Alice",
      child_age: 3,
      likes: 12,
      reply_count: 5,
      created_at: "20250101",
    },
    {
      qid: "q2",
      title: "Sleep regression at 6 months?",
      author_name: "Bob",
      child_age: 1,
      likes: 22,
      reply_count: 8,
      created_at: "20250102",
    },
    {
      qid: "q3",
      title: "Best educational toys for a 2-year-old?",
      author_name: "Carol",
      child_age: 2,
      likes: 8,
      reply_count: 3,
      created_at: "20250103",
    },
  ];

  useEffect(() => {
    setItems(null); // show spinner first
    setTimeout(() => {
      const filtered = mockResults.filter((item) =>
        item.title.toLowerCase().includes(q.toLowerCase())
      );
      setItems(filtered);
    }, 600);
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
      style={{ backgroundColor: colors.base.background }} // neutral bg
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
