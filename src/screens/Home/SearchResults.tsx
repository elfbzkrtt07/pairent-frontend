import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import { fetchAuthSession } from "aws-amplify/auth";

export default function SearchResults({ route, navigation }: any) {
  const { q } = route.params as { q: string };
  const [items, setItems] = useState<ForumCardItem[] | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setItems(null); 

        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        const res = await fetch(`http://localhost:5000/questions/search?q=${encodeURIComponent(q)}`, {
          method: "GET",
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch search results:", res.status);
          return;
        }

        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    fetchSearchResults();
  }, [q]);

  // ✅ Add the missing return statement
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

