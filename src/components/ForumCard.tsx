// src/components/ForumCard.tsx
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import colors from "../styles/colors";
import { likeQuestion } from "../services/forum"; 

export type ForumCardItem = {
  qid: string;
  title: string;
  author_name: string;
  child_age: number;
  likes: number;
  reply_count: number;
  created_at?: string; // YYYYMMDDHHMMSS
};

export default function ForumCard({
  item,
  onPress,
  onReplyPress,
}: {
  item: ForumCardItem;
  onPress: () => void;
  onReplyPress?: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const newLike = !liked;
      setLiked(newLike);
      setLikes((prev) => prev + (newLike ? 1 : -1));

      // call backend
      const updatedLikes = await likeQuestion(item.qid, newLike);
      setLikes(updatedLikes);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setLiked((prev) => !prev);
      setLikes(item.likes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.peach.light,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "transparent",
      }}
    >
      {/* Make title pressable */}
      <Pressable onPress={onPress}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 12,
            color: colors.base.text,
          }}
        >
          {item.title}
        </Text>
      </Pressable>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Avatar */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.peach.text,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18, color: colors.peach.text }}>👤</Text>
        </View>

        <Text style={{ fontSize: 16, color: colors.base.text }}>
          {item.author_name}
        </Text>

        {/* child age badge */}
        <View
          style={{
            marginLeft: 12,
            backgroundColor: colors.peach.dark,
            borderRadius: 24,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {item.child_age + " yrs"}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* metrics */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          {/* Reply button */}
          <Pressable
            onPress={onReplyPress ?? onPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 16, color: colors.peach.text }}>💬</Text>
            <Text
              style={{ fontSize: 16, marginLeft: 4, color: colors.base.text }}
            >
              {item.reply_count}
            </Text>
          </Pressable>

          {/* Like button */}
          <Pressable
            onPress={handleLike}
            disabled={loading}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {liked ? "❤️" : "🤍"}
            </Text>
            <Text
              style={{ fontSize: 16, marginLeft: 4, color: colors.base.text }}
            >
              {likes}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
