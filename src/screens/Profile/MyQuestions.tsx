import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert, RefreshControl } from "react-native";
import ForumCard, { ForumCardItem } from "../../components/ForumCard";
import { listMyQuestions, deleteQuestion } from "../../services/forum";
import colors from "../../styles/colors";

export default function MyQuestions({ navigation }: any) {
  const [items, setItems] = useState<ForumCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMine = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listMyQuestions({});
      setItems((data.items as any[]) || []);
    } catch (err) {
      console.error("Error fetching my questions:", err);
      setItems([]);
      Alert.alert("Error", "Could not load your questions. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  const handleDelete = async (qid: string) => {
     console.log("1. Attempting to delete question with qid:", qid);
    try {
      console.log("2. Deleting question:", qid);
      await deleteQuestion(qid);
      setItems((prev) => prev.filter((item) => item.qid !== qid));
    } catch (err) {
        console.log("3. Error deleting question:", err);
      console.error("Error deleting question:", err);
    }
};


  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.base.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.aqua.dark} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, backgroundColor: colors.base.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMine(); }} />
      }
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          marginBottom: 16,
          color: colors.aqua.text,
        }}
      >
        My Questions
      </Text>

      {items.length === 0 ? (
        <Text style={{ color: colors.base.text, textAlign: "center", marginTop: 32 }}>
          You haven’t posted any questions yet.
        </Text>
      ) : (
        items.map((item) => (
          <View key={item.qid} style={{ marginBottom: 16 }}>
            <ForumCard
              item={item}
              onPress={() => navigation.navigate("QuestionDetail", { qid: item.qid })}
              onReplyPress={() => navigation.navigate("QuestionDetail", { qid: item.qid })}
            />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
              <Pressable onPress={() => handleDelete(item.qid)}>
                <Text style={{ color: colors.peach.dark, fontWeight: "600" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
