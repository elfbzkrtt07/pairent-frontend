// src/components/ForumCard.tsx
import { useState } from "react";
import { View, Text, Pressable } from "react-native";

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
  onLike,
  onReplyPress,
}: {
  item: ForumCardItem;
  onPress: () => void;
  onLike?: () => void;
  onReplyPress?: () => void;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#ededed",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        {item.title}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Avatar */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: "#9ca3af",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18, color: "#6b7280" }}>👤</Text>
        </View>

        <Text style={{ fontSize: 16 }}>{item.author_name}</Text>

        {/* child age badge */}
        <View
          style={{
            marginLeft: 12,
            backgroundColor: "#6b7280",
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

        {/* metrics as buttons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          <Pressable
            onPress={onReplyPress ? onReplyPress : onPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: "transparent",
            }}
          >
            <Text style={{ fontSize: 16 }}>💬</Text>
            <Text style={{ fontSize: 16, marginLeft: 4 }}>{item.reply_count}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setLiked((v) => !v);
              if (onLike) onLike();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 16 }}>{liked ? "❤️" : "🤍"}</Text>
            <Text style={{ fontSize: 16, marginLeft: 4 }}>{item.likes + (liked ? 1 : 0)}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
