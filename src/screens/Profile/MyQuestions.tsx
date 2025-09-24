import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from "react-native";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import { fetchAuthSession } from "aws-amplify/auth";
import colors from "../../styles/colors";

export default function MyQuestions({ navigation }: any) {
  const [items, setItems] = useState<ForumCardItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMine = async () => {
      try {
        setLoading(true);

        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        const res = await fetch("http://localhost:5000/questions/me", {
          method: "GET",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        if (!res.ok) {
          console.error("Failed to load my questions:", res.status);
          setItems([]);
          return;
        }

        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error("Error fetching my questions:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadMine();
  }, []);

  const handleDelete = async (qid: string) => {
    Alert.alert("Delete Question", "Are you sure you want to delete this question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const session = await fetchAuthSession();
            const token = session.tokens?.accessToken?.toString();

            await fetch(`http://localhost:5000/questions/${qid}`, {
              method: "DELETE",
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            });

            setItems((prev) => prev ? prev.filter((item) => item.qid !== qid) : prev);
          } catch (err) {
            console.error("Error deleting question:", err);
          }
        },
      },
    ]);
  };

  if (loading || !items) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.base.background }}>
        <ActivityIndicator size="large" color={colors.aqua.dark} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: colors.base.background }}>
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 16, color: colors.aqua.text }}>
        My Questions
      </Text>
      {items.map((item) => (
        <View key={item.qid} style={{ marginBottom: 16 }}>
          <ForumCard
            item={item}
            onPress={() => navigation.navigate("QuestionDetail", { qid: item.qid })}
            onReplyPress={() => navigation.navigate("QuestionDetail", { qid: item.qid })}
          />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
            <Pressable onPress={() => navigation.navigate("EditQuestion", { qid: item.qid })}>
              <Text style={{ color: colors.aqua.text, fontWeight: "600" }}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(item.qid)}>
              <Text style={{ color: colors.peach.dark, fontWeight: "600" }}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
