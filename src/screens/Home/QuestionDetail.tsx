// src/screens/Home/QuestionDetail.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, TextInput, Pressable, Alert, Platform } from "react-native";
import {
  getQuestion,
  listReplies,
  createReply,
  likeQuestion,
  likeReply,
  deleteReply,
  getSaved,
  saveDiscussion,
  unsaveDiscussion,
  type QuestionDetail as QD,
  type Reply as ReplyT,
} from "../../services/forum";
import { useAuth } from "../../context/AuthContext";

export default function QuestionDetailScreen({ route, navigation }: any) {
  const { qid } = route.params as { qid: string };
  const { user } = useAuth();

  const [q, setQ] = useState<QD | null>(null);
  const [loading, setLoading] = useState(true);

  const [replyMap, setReplyMap] = useState<Record<string, ReplyT[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingChildren, setLoadingChildren] = useState<Record<string, boolean>>({});
  const [likedQuestion, setLikedQuestion] = useState(false);
  const [saved, setSaved] = useState(false);

  const [replyLiked, setReplyLiked] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const ROOT = "__root__";
  const currentDisplayName =
    (user?.name as string) || (user?.username as string) || (user?.email as string) || "Anonymous parent";

  const isOwner = !!q && q.name === currentDisplayName;

  // initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [question, topLevel, savedState] = await Promise.all([
        getQuestion(qid),
        listReplies({ qid, parentId: null }),
        getSaved(qid),
      ]);
      if (!mounted) return;
      setQ(question);
      setReplyMap({ [ROOT]: topLevel.items });
      setSaved(savedState.saved);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [qid]);

  const topLevelReplies = replyMap[ROOT] ?? [];

  // 🔑 Save/Unsave toggle
  const onToggleSaved = useCallback(async () => {
    const next = !saved;
    setSaved(next);
    try {
      if (next) await saveDiscussion(qid);
      else await unsaveDiscussion(qid);
    } catch (e) {
      setSaved(!next); // revert on error
    }
  }, [saved, qid]);

  const handleToggleChildren = useCallback(async (parentRid: string) => {
    const isOpen = !!expanded[parentRid];
    if (isOpen) {
      setExpanded((prev) => ({ ...prev, [parentRid]: false }));
      return;
    }
    if (!replyMap[parentRid]) {
      setLoadingChildren((prev) => ({ ...prev, [parentRid]: true }));
      const { items } = await listReplies({ qid, parentId: parentRid });
      setReplyMap((prev) => ({ ...prev, [parentRid]: items }));
      setLoadingChildren((prev) => ({ ...prev, [parentRid]: false }));
    }
    setExpanded((prev) => ({ ...prev, [parentRid]: true }));
  }, [expanded, replyMap, qid]);

  const onToggleQuestionLike = useCallback(async () => {
    const next = !likedQuestion;
    setLikedQuestion(next);
    const newCount = await likeQuestion(qid, next);
    setQ((prev) => (prev ? { ...prev, likes: newCount } : prev));
  }, [likedQuestion, qid]);

  const onToggleReplyLike = useCallback(async (rid: string) => {
    const next = !replyLiked[rid];
    setReplyLiked((prev) => ({ ...prev, [rid]: next }));
    const newCount = await likeReply(rid, next);
    setReplyMap((prev) => {
      const clone: Record<string, ReplyT[]> = {};
      for (const k of Object.keys(prev)) {
        clone[k] = prev[k].map((r) => (r.rid === rid ? { ...r, likes: newCount } : r));
      }
      return clone;
    });
  }, [replyLiked]);

  const onSetReplyTarget = useCallback((rid: string | null) => setReplyTo(rid), []);

  const onSubmitReply = useCallback(async () => {
    const text = replyText.trim();
    if (!text || !q) return;

    const parentId = replyTo ?? null;
    const newReply = await createReply({ qid: q.qid, parentId, body: text, name: currentDisplayName });

    setReplyText("");
    setReplyTo(null);

    setReplyMap((prev) => {
      if (parentId === null) return { ...prev, [ROOT]: [...(prev[ROOT] ?? []), newReply] };
      const existing = prev[parentId] ?? [];
      return { ...prev, [parentId]: [...existing, newReply] };
    });
    if (parentId) setExpanded((prev) => ({ ...prev, [parentId]: true }));
  }, [replyText, q, replyTo, currentDisplayName]);

  // delete reply (only own replies)
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
      await deleteReply(rid);
      setReplyMap((prev) => {
        const toRemove = new Set<string>([rid]);
        let grew = true;
        while (grew) {
          grew = false;
          for (const list of Object.values(prev)) {
            for (const r of list) {
              if (r.parentId && toRemove.has(r.parentId) && !toRemove.has(r.rid)) {
                toRemove.add(r.rid);
                grew = true;
              }
            }
          }
        }
        const next: Record<string, ReplyT[]> = {};
        for (const key of Object.keys(prev)) {
          if (toRemove.has(key)) continue;
          next[key] = prev[key].filter((r) => !toRemove.has(r.rid));
        }
        return next;
      });
    } catch (e) {
      if (Platform.OS !== "web") {
        Alert.alert("Error", "Could not delete reply.");
      }
    }
  }, []);

  const renderReplyNode = useCallback((r: ReplyT, level: number) => {
    const children = replyMap[r.rid] ?? [];
    const isOpen = !!expanded[r.rid];
    const isLoading = !!loadingChildren[r.rid];
    const isMe = r.name === currentDisplayName;

    return (
      <View key={r.rid} style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 8, marginLeft: level * 16 }}>
        <Text style={{ fontWeight: "700", marginBottom: 4 }}>{r.name}</Text>
        <Text style={{ marginBottom: 8 }}>{r.body}</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => onToggleReplyLike(r.rid)} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>{replyLiked[r.rid] ? "❤️" : "🤍"}</Text>
            <Text style={{ fontSize: 16, marginLeft: 6 }}>{r.likes}</Text>
          </Pressable>

          <Pressable onPress={() => onSetReplyTarget(r.rid)} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>💬</Text>
            <Text style={{ fontSize: 14, marginLeft: 6, color: "#2563eb" }}>Reply</Text>
          </Pressable>

          <Pressable onPress={() => handleToggleChildren(r.rid)} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 14, color: "#2563eb" }}>
              {isOpen ? "Hide replies" : "View all replies"}
            </Text>
          </Pressable>

          {isMe && (
            <Pressable onPress={() => onDeleteReply(r.rid)} style={{ marginLeft: 6 }}>
              <Text style={{ fontSize: 14, color: "#b91c1c" }}>Delete</Text>
            </Pressable>
          )}
        </View>

        {isLoading && <View style={{ marginTop: 10 }}><ActivityIndicator /></View>}
        {isOpen && !isLoading && children.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {children.map((child) => renderReplyNode(child, level + 1))}
          </View>
        )}
      </View>
    );
  }, [expanded, loadingChildren, onSetReplyTarget, onToggleReplyLike, replyLiked, replyMap, handleToggleChildren, onDeleteReply, currentDisplayName]);

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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} style={{ backgroundColor: "#f3f4f6" }}>
      {/* Question header */}
      <View style={{ backgroundColor: "#ededed", borderRadius: 12, padding: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 8 }}>{q.title}</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Text>👤 {q.name}</Text>
          <View style={{ backgroundColor: "#6b7280", borderRadius: 24, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: "white", fontWeight: "600" }}>{q.child_age_label}</Text>
          </View>

          <View style={{ flex: 1 }} />

          {/* Save/Unsave */}
          <Pressable onPress={onToggleSaved} style={{ flexDirection: "row", alignItems: "center", marginRight: 8 }}>
            <Text style={{ fontSize: 16 }}>{saved ? "🔖" : "🏷️"}</Text>
            <Text style={{ fontSize: 14, marginLeft: 6, color: "#2563eb" }}>
              {saved ? "Saved" : "Save"}
            </Text>
          </Pressable>

          {/* Like */}
          <Pressable onPress={onToggleQuestionLike} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>{likedQuestion ? "❤️" : "🤍"}</Text>
            <Text style={{ fontSize: 16, marginLeft: 6 }}>{q.likes}</Text>
          </Pressable>
        </View>

        <Text style={{ lineHeight: 22 }}>{q.body}</Text>

        {/* Edit/Delete buttons only for owner */}
        {isOwner && (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <Pressable onPress={() => navigation.navigate("EditQuestion", { qid: q.qid })}>
              <Text style={{ color: "#2563eb" }}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                Alert.alert("Delete Question", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => console.log("TODO: call DELETE /questions/" + q.qid),
                  },
                ])
              }
            >
              <Text style={{ color: "#b91c1c" }}>Delete</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Replies */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>Replies</Text>
        {topLevelReplies.map((r) => renderReplyNode(r, 0))}
      </View>

      {/* Composer */}
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
          {replyingToObj
            ? `Replying to ${replyingToObj.name}: "${replyingToObj.body.slice(0, 40)}${replyingToObj.body.length > 40 ? "..." : ""}"`
            : "Add a reply"}
        </Text>

        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Write your reply..."
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 12,
            marginBottom: 8,
            minHeight: 48,
          }}
          multiline
        />

        <Pressable
          onPress={onSubmitReply}
          style={{
            backgroundColor: "#111827",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {replyingToObj ? "Reply" : "Send"}
          </Text>
        </Pressable>

        {replyTo && (
          <Pressable
            onPress={() => setReplyTo(null)}
            style={{ marginTop: 8, alignSelf: "flex-end", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: "#f3f4f6" }}
          >
            <Text style={{ color: "#2563eb" }}>Cancel reply</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}