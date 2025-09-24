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
import { fetchAuthSession } from "aws-amplify/auth";
import colors from "../../styles/colors";

type Question = {
  qid: string;
  title: string;
  body: string;
  name: string;
  child_age_label: string;
  likes: number;
};

type Reply = {
  rid: string;
  parentId: string | null;
  body: string;
  name: string;
  likes: number;
};

export default function QuestionDetailScreen({ route, navigation }: any) {
  const { qid } = route.params as { qid: string };

  const [q, setQ] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  const [replyMap, setReplyMap] = useState<Record<string, Reply[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingChildren, setLoadingChildren] = useState<Record<string, boolean>>({});
  const [likedQuestion, setLikedQuestion] = useState(false);
  const [saved, setSaved] = useState(false);

  const [replyLiked, setReplyLiked] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const ROOT = "__root__";

  // Initial load: fetch question + replies + saved
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        const [qRes, repliesRes, savedRes] = await Promise.all([
          fetch(`http://localhost:5000/questions/${qid}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }),
          fetch(`http://localhost:5000/questions/${qid}/replies`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }),
          fetch(`http://localhost:5000/questions/${qid}/saved`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }),
        ]);

        if (!qRes.ok || !repliesRes.ok) {
          console.error("Failed to load question or replies");
          return;
        }

        const qData = await qRes.json();
        const repliesData = await repliesRes.json();
        const savedData = savedRes.ok ? await savedRes.json() : { saved: false };

        setQ(qData);
        setReplyMap({ [ROOT]: repliesData.items || [] });
        setSaved(savedData.saved || false);
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [qid]);

  const topLevelReplies = replyMap[ROOT] ?? [];

  const onToggleSaved = useCallback(async () => {
    const next = !saved;
    setSaved(next);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      const res = await fetch(`http://localhost:5000/questions/${qid}/saved`, {
        method: next ? "POST" : "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        setSaved(!next); // revert on error
      }
    } catch {
      setSaved(!next);
    }
  }, [saved, qid]);

  const handleToggleChildren = useCallback(
    async (parentRid: string) => {
      const isOpen = !!expanded[parentRid];
      if (isOpen) {
        setExpanded((prev) => ({ ...prev, [parentRid]: false }));
        return;
      }

      if (!replyMap[parentRid]) {
        setLoadingChildren((prev) => ({ ...prev, [parentRid]: true }));
        try {
          const session = await fetchAuthSession();
          const token = session.tokens?.accessToken?.toString();

          const res = await fetch(
            `http://localhost:5000/questions/${qid}/replies?parentId=${parentRid}`,
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
          );

          if (res.ok) {
            const data = await res.json();
            setReplyMap((prev) => ({ ...prev, [parentRid]: data.items || [] }));
          }
        } finally {
          setLoadingChildren((prev) => ({ ...prev, [parentRid]: false }));
        }
      }

      setExpanded((prev) => ({ ...prev, [parentRid]: true }));
    },
    [expanded, replyMap, qid]
  );

  const onToggleQuestionLike = useCallback(async () => {
    const next = !likedQuestion;
    setLikedQuestion(next);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      const res = await fetch(`http://localhost:5000/questions/${qid}/like`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ like: next }),
      });

      if (res.ok) {
        const data = await res.json();
        setQ((prev) => (prev ? { ...prev, likes: data.likes } : prev));
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  }, [likedQuestion, qid]);

  const onToggleReplyLike = useCallback(
    async (rid: string) => {
      const next = !replyLiked[rid];
      setReplyLiked((prev) => ({ ...prev, [rid]: next }));

      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        const res = await fetch(`http://localhost:5000/replies/${rid}/like`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ like: next }),
        });

        if (res.ok) {
          const data = await res.json();
          setReplyMap((prev) => {
            const clone: Record<string, Reply[]> = {};
            for (const k of Object.keys(prev)) {
              clone[k] = prev[k].map((r) =>
                r.rid === rid ? { ...r, likes: data.likes } : r
              );
            }
            return clone;
          });
        }
      } catch (err) {
        console.error("Reply like failed:", err);
      }
    },
    [replyLiked]
  );

  const onSubmitReply = useCallback(async () => {
    const text = replyText.trim();
    if (!text || !q) return;

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      const res = await fetch(`http://localhost:5000/questions/${qid}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ parentId: replyTo, body: text }),
      });

      if (res.ok) {
        const newReply = await res.json();
        setReplyText("");
        setReplyTo(null);

        setReplyMap((prev) => {
          if (replyTo === null)
            return { ...prev, [ROOT]: [...(prev[ROOT] ?? []), newReply] };
          const existing = prev[replyTo] ?? [];
          return { ...prev, [replyTo]: [...existing, newReply] };
        });
        if (replyTo) setExpanded((prev) => ({ ...prev, [replyTo]: true }));
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  }, [replyText, q, replyTo, qid]);

  const onDeleteReply = useCallback(async (rid: string) => {
    let confirmed = true;
    if (Platform.OS === "web") {
      // @ts-ignore
      confirmed = window.confirm?.("Delete this reply?") ?? true;
    } else {
      confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert("Delete reply", "Are you sure you want to delete this reply?", [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "Delete", style: "destructive", onPress: () => resolve(true) },
        ]);
      });
    }
    if (!confirmed) return;

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      await fetch(`http://localhost:5000/replies/${rid}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

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
  }, []);

  const renderReplyNode = useCallback(
    (r: Reply, level: number) => {
      const children = replyMap[r.rid] ?? [];
      const isOpen = !!expanded[r.rid];
      const isLoading = !!loadingChildren[r.rid];

      return (
        <View
          key={r.rid}
          style={{
            backgroundColor: colors.aqua.light,
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
            marginLeft: level * 16,
            borderWidth: 1,
            borderColor: colors.base.border,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 4, color: colors.base.text }}>{r.name}</Text>
          <Text style={{ marginBottom: 8, color: colors.base.text }}>{r.body}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={() => onToggleReplyLike(r.rid)}>
              <Text style={{ fontSize: 14, color: colors.aqua.text }}>
                {replyLiked[r.rid] ? "❤️" : "🤍"} {r.likes}
              </Text>
            </Pressable>

            <Pressable onPress={() => setReplyTo(r.rid)}>
              <Text style={{ fontSize: 14, color: colors.aqua.text }}>💬 Reply</Text>
            </Pressable>

            <Pressable onPress={() => handleToggleChildren(r.rid)}>
              <Text style={{ fontSize: 14, color: colors.aqua.text }}>
                {isOpen ? "Hide replies" : "View all replies"}
              </Text>
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
    [expanded, loadingChildren, replyMap, replyLiked, onToggleReplyLike, handleToggleChildren, onDeleteReply]
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
          <Text style={{ color: colors.base.text }}>👤 {q.name}</Text>
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
              {likedQuestion ? "❤️ Liked" : "🤍 Like"} ({q.likes})
            </Text>
          </Pressable>
        </View>

        <Text style={{ lineHeight: 22, color: colors.base.text }}>{q.body}</Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8, color: colors.base.text }}>
          Replies
        </Text>
        {topLevelReplies.map((r) => renderReplyNode(r, 0))}
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8, color: colors.base.text }}>
          {replyingToObj
            ? `Replying to ${replyingToObj.name}: "${replyingToObj.body.slice(0, 40)}${
                replyingToObj.body.length > 40 ? "..." : ""
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
