import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import { fetchAuthSession } from "aws-amplify/auth";
import colors from "../../styles/colors";

export default function SavedForums({ navigation }: any) {
  const [items, setItems] = useState<ForumCardItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        setLoading(true);

        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        const res = await fetch("http://localhost:5000/questions/saved", {
          method: "GET",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        if (!res.ok) {
          console.error("Failed to load saved questions:", res.status);
          setItems([]);
          return;
        }

        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error("Error fetching saved forums:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, []);

  const handleUnsave = async (qid: string) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      await fetch(`http://localhost:5000/questions/${qid}/save`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      setItems((prev) => prev ? prev.filter((item) => item.qid !== qid) : prev);
    } catch (err) {
      console.error("Error unsaving:", err);
    }
  };

  if (loading || !items) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.base.background }}>
        <ActivityIndicator size="large" color={colors.peach.dark} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: colors.base.background }}>
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 16, color: colors.peach.text }}>
        Saved Forums
      </Text>
      {items.map((item) => (
        <View key={item.qid} style={{ marginBottom: 16 }}>
          <ForumCard
            item={item}
            onPress={() => navigation.navigate("QuestionDetail", { qid: item.qid })}
            onReplyPress={() => navigation.navigate("QuestionDetail", { qid: item.qid })}
          />
          <Pressable
            onPress={() => handleUnsave(item.qid)}
            style={{
              marginTop: 6,
              alignSelf: "flex-start",
              backgroundColor: colors.peach.dark,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Unsave</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
