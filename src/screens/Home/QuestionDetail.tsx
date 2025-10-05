// src/screens/Home/QuestionDetail.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from "react-native";

import {
  getQuestion,
  getSaved,
  saveDiscussion,
  unsaveDiscussion,
  getLikeStatus,
  getReplyLikeStatus,
  likeQuestion,
  unlikeQuestion,
  likeReply,
  unlikeReply,
  deleteReply,
  createReply,
} from "../../services/forum";

import colors from "../../styles/colors";

type Question = {
  qid: string;
  title: string;
  body: string;
  author_name: string;
  child_age_label: string;
  likes: number;
  Replies?: Reply[];
};

type Reply = {
  rid: string;
  parent_id: string | null;
  body: string;
  name: string;
  likes: number;
};

export default function QuestionDetailScreen({ route }: any) {
  const { qid } = route.params as { qid: string };

  const [q, setQ] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  const [replyMap, setReplyMap] = useState<Record<string, Reply[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingChildren, setLoadingChildren] = useState<Record<string, boolean>>({});
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const ROOT = "__root__";

  // 🔄 Load question + replies + like states
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [qData, qLikeData, savedData] = await Promise.all([
          getQuestion(qid),
          getLikeStatus(qid),
          getSaved(qid),
        ]);

        setQ(qData);

        // group replies for nested display
        const replies = qData.Replies || [];
        const grouped: Record<string, Reply[]> = { [ROOT]: [] };
        for (const r of replies) {
          const parent = r.parent_id && r.parent_id !== qid ? r.parent_id : ROOT;
          if (!grouped[parent]) grouped[parent] = [];
          grouped[parent].push(r);
        }
        setReplyMap(grouped);

        // prepare like map
        const likeMap: Record<string, boolean> = {};
        likeMap[qid] = !!qLikeData.liked;

        await Promise.all(
          replies.map(async (r) => {
            try {
              const res = await getReplyLikeStatus(qid, r.rid);
              likeMap[r.rid] = res.liked;
            } catch {
              likeMap[r.rid] = false;
            }
          })
        );

        setLikes(likeMap);
        setSaved(!!savedData.saved);
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [qid]);

  const topLevelReplies = replyMap[ROOT] ?? [];

  // 💾 Save toggle
  const onToggleSaved = useCallback(async () => {
    const next = !saved;
    setSaved(next);
    try {
      if (next) await saveDiscussion(qid);
      else await unsaveDiscussion(qid);
    } catch {
      setSaved(!next);
    }
  }, [saved, qid]);

  // ❤️ Question like toggle
  const onToggleQuestionLike = useCallback(async () => {
    const prev = likes[qid] ?? false;
    const next = !prev;

    setLikes((prevLikes) => ({ ...prevLikes, [qid]: next }));
    setQ((prev) => (prev ? { ...prev, likes: prev.likes + (next ? 1 : -1) } : prev));

    try {
      if (next) await likeQuestion(qid);
      else await unlikeQuestion(qid);
    } catch (err) {
      console.error("Question like failed:", err);
      // revert
      setLikes((prevLikes) => ({ ...prevLikes, [qid]: prev }));
      setQ((prev) => (prev ? { ...prev, likes: prev.likes + (next ? -1 : 1) } : prev));
    }
  }, [likes, qid]);

  const onToggleReplyLike = useCallback(
    async (rid: string) => {
      const prev = likes[rid] ?? false;
      const next = !prev;

      setLikes((prevLikes) => ({ ...prevLikes, [rid]: next }));
      setReplyMap((prev) => {
        const clone: Record<string, Reply[]> = {};
        for (const k of Object.keys(prev)) {
          clone[k] = prev[k].map((r) =>
            r.rid === rid ? { ...r, likes: r.likes + (next ? 1 : -1) } : r
          );
        }
        return clone;
      });

      try {
        if (next) await likeReply(qid, rid);
        else await unlikeReply(qid, rid);
      } catch (err) {
        console.error("Reply like failed:", err);
        setLikes((prevLikes) => ({ ...prevLikes, [rid]: prev }));
      }
    },
    [likes, qid]
  );

  // ✏️ Submit reply
  const onSubmitReply = useCallback(async () => {
    const text = replyText.trim();
    if (!text || !q) return;

    try {
      const newReply = await createReply({
        qid,
        parent_id: replyTo,
        body: text,
      });

      const enrichedReply = {
        ...newReply,
        name: newReply.name ?? "You",
      };

      setReplyText("");
      setReplyTo(null);

      setReplyMap((prev) => {
        if (!replyTo) {
          return { ...prev, [ROOT]: [...(prev[ROOT] ?? []), enrichedReply] };
        }
        const existing = prev[replyTo] ?? [];
        return { ...prev, [replyTo]: [...existing, enrichedReply] };
      });

      if (replyTo) setExpanded((prev) => ({ ...prev, [replyTo]: true }));
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  }, [replyText, q, replyTo, qid]);

  // 🗑️ Delete reply
  const onDeleteReply = useCallback(async (rid: string) => {
    let confirmed = true;
    if (Platform.OS === "web") {
      // @ts-ignore
      confirmed = window.confirm?.("Delete this reply?") ?? true;
    } else {
      confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert("Delete reply", "Are you sure?", [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "Delete", style: "destructive", onPress: () => resolve(true) },
        ]);
      });
    }
    if (!confirmed) return;

    try {
      await deleteReply(qid, rid);
      setReplyMap((prev) => {
        const next: Record<string, Reply[]> = {};
        for (const key of Object.keys(prev)) {
          next[key] = prev[key].filter((r) => r.rid !== rid);
        }
        return next;
      });
    } catch (err) {
      console.error("Failed to delete reply:", err);
    }
  }, [qid]);

  // 🔁 Recursive reply renderer
  const renderReplyNode = useCallback(
    (r: Reply, level: number) => {
      const children = replyMap[r.rid] ?? [];
      const isOpen = expanded[r.rid] ?? true;
      const isLiked = likes[r.rid] ?? false;
      const isLoading = !!loadingChildren[r.rid];

      return (
        <View
          key={r.rid}
          style={{
            backgroundColor: colors.aqua.light,
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
            marginLeft: level * 20,
            borderLeftWidth: level > 0 ? 3 : 0,
            borderLeftColor: level > 0 ? colors.aqua.dark : "transparent",
            borderWidth: 1,
            borderColor: colors.base.border,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 4, color: colors.base.text }}>
            {r.name}
          </Text>
          <Text style={{ marginBottom: 8, color: colors.base.text }}>{r.body}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={() => onToggleReplyLike(r.rid)}>
              <Text style={{ fontSize: 14, color: isLiked ? "red" : colors.aqua.text }}>
                {isLiked ? "❤️" : "🤍"} {r.likes}
              </Text>
            </Pressable>

            <Pressable onPress={() => setReplyTo(r.rid)}>
              <Text style={{ fontSize: 14, color: colors.aqua.text }}>💬</Text>
            </Pressable>

            <Pressable onPress={() => onDeleteReply(r.rid)}>
              <Text style={{ fontSize: 14, color: colors.aqua.dark }}>Delete</Text>
            </Pressable>
          </View>

          {isLoading && (
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator color={colors.aqua.dark} />
            </View>
          )}
          {isOpen && !isLoading && children.length > 0 && (
            <View style={{ marginTop: 10 }}>
              {children.map((child) => renderReplyNode(child, level + 1))}
            </View>
          )}
        </View>
      );
    },
    [expanded, loadingChildren, replyMap, likes, onToggleReplyLike, onDeleteReply]
  );

  const replyingToObj = useMemo(() => {
    if (!replyTo) return null;
    for (const list of Object.values(replyMap)) {
      const found = list.find((r) => r.rid === replyTo);
      if (found) return found;
    }
    return null;
  }, [replyTo, replyMap]);

  if (loading || !q) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.aqua.dark} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} style={{ backgroundColor: colors.base.background }}>
      {/* 🟢 Question Section */}
      <View
        style={{
          backgroundColor: colors.aqua.light,
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.base.border,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 8, color: colors.base.text }}>
          {q.title}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Text style={{ color: colors.base.text }}>👤 {q.author_name}</Text>
          <View
            style={{
              backgroundColor: colors.aqua.dark,
              borderRadius: 24,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>{q.child_age_label}</Text>
          </View>

          <View style={{ flex: 1 }} />

          <Pressable onPress={onToggleSaved} style={{ marginRight: 8 }}>
            <Text style={{ fontSize: 14, color: colors.aqua.text }}>
              {saved ? "🔖 Saved" : "🏷️ Save"}
            </Text>
          </Pressable>

          <Pressable onPress={onToggleQuestionLike}>
            <Text style={{ fontSize: 14, color: colors.aqua.text }}>
              {likes[qid] ? "❤️" : "🤍"} {q.likes}
            </Text>
          </Pressable>
        </View>

        <Text style={{ lineHeight: 22, color: colors.base.text }}>{q.body}</Text>
      </View>

      {/* 🟣 Replies */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8, color: colors.base.text }}>
          Replies
        </Text>
        {topLevelReplies.map((r) => renderReplyNode(r, 0))}
      </View>

      {/* 🟠 Reply input */}
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8, color: colors.base.text }}>
          {replyingToObj
            ? `Replying to ${replyingToObj.name || "Unknown"}: "${(replyingToObj.body || "").slice(0, 40)}${
                (replyingToObj.body?.length ?? 0) > 40 ? "..." : ""
              }"`
            : "Add a reply"}
        </Text>

        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Write your reply..."
          placeholderTextColor={colors.base.text}
          style={{
            backgroundColor: colors.aqua.light,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.base.border,
            padding: 12,
            marginBottom: 8,
            minHeight: 48,
            color: colors.base.text,
          }}
          multiline
        />

        <Pressable
          onPress={onSubmitReply}
          style={{
            backgroundColor: colors.aqua.dark,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {replyingToObj ? "Reply" : "Send"}
          </Text>
        </Pressable>

        {replyTo && (
          <Pressable
            onPress={() => setReplyTo(null)}
            style={{
              marginTop: 8,
              alignSelf: "flex-end",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: colors.aqua.light,
            }}
          >
            <Text style={{ color: colors.aqua.text }}>Cancel reply</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
