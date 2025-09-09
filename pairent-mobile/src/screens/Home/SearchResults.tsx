import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";

export default function SearchResults({ route, navigation }: any) {
  const { q } = route.params as { q: string };
  const [items, setItems] = useState<ForumCardItem[] | null>(null);

  useEffect(() => {
    // mock search: in real app call your API with q
    const t = setTimeout(() => {
      setItems([
        {
          qid: "1",
          title: "My baby wakes up at night, how can I make him sleep better?",
          author_name: "janedoe_87",
          child_age: 2,
          reply_count: 20,
          likes: 120,
        },
        {
          qid: "3",
          title: "Potty training tips for a stubborn toddler?",
          author_name: "maria88",
          child_age: 13,
          reply_count: 44,
          likes: 80,
        },
      ]);
    }, 500);
    return () => clearTimeout(t);
  }, [q]);

  if (!items) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 12 }}>
        {items.length} result{items.length !== 1 ? "s" : ""} found with “{q}”
      </Text>

      {items.map((item) => (
        <ForumCard
          key={item.qid}
          item={item}
          onPress={() => navigation.navigate("QuestionDetail", { qid: item.qid })}
          onReplyPress={() => navigation.navigate("QuestionDetail", { qid: item.qid })}
        />
      ))}
    </ScrollView>
  );
}
