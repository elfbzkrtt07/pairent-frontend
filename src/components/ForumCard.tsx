// src/components/ForumCard.tsx
import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import colors from "../styles/colors";
import { likeQuestion, unlikeQuestion, getLikeStatus } from "../services/forum";

export type ForumCardItem = {
  qid: string;
  title: string;
  author_name: string;
  child_age_label: string;   // string label, e.g. "3 yrs"
  likes: number;
  created_at?: string; // YYYYMMDDHHMMSS
};

export default function ForumCard({
  item,
  onPress,
  onReplyPress,
  onAuthorPress,
}: {
  item: ForumCardItem;
  onPress: () => void;
  onReplyPress?: () => void;
  onAuthorPress?: (username: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const [loading, setLoading] = useState(false);

  // fetch initial like status
  useEffect(() => {
    (async () => {
      try {
        const status = await getLikeStatus(item.qid);
        setLiked(status.liked);
      } catch (err) {
        console.error("Failed to fetch like status:", err);
      }
    })();
  }, [item.qid]);

  const handleLike = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const next = !liked;
      setLiked(next);
      setLikes((prev) => prev + (next ? 1 : -1));

      if (next) {
        await likeQuestion(item.qid);
      } else {
        await unlikeQuestion(item.qid);
      }
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
        backgroundColor: colors.aqua.light,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.base.border,
      }}
    >
      {/* Title */}
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
            borderColor: colors.aqua.text,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18, color: colors.aqua.text }}>👤</Text>
        </View>

        {/* Author name as button */}
        <Pressable onPress={() => onAuthorPress?.(item.author_name)}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.aqua.text,
              textDecorationLine: "underline",
            }}
          >
            {item.author_name}
          </Text>
        </Pressable>

        {/* Child age badge */}
        {item.child_age_label ? (
          <View
            style={{
              marginLeft: 12,
              backgroundColor: colors.aqua.dark,
              borderRadius: 24,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              {item.child_age_label}
            </Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />

        {/* Metrics */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          {/* Reply button */}
          <Pressable
            onPress={onReplyPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 20, color: colors.aqua.text }}>💬</Text>
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
            <Text style={{ fontSize: 20 }}>
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
