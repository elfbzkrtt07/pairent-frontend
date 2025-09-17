// src/screens/Profile/ProfilePublic.tsx
import { View, Text, ScrollView, Pressable } from "react-native";

export default function ProfilePublic({ route, navigation }: any) {
  const { userId, username } = route.params || {};
  const displayName = username?.replace(/[_]/g, " ") || "Emma Turner";
  const handle = username || "emma_turner";

  // mock data
  const questions = [
    {
      qid: "q1",
      title:
        "My 2-year-old refuses to eat vegetables, what can I do to encourage healthy eating?",
      age: "2 yrs",
      replies: 20,
      likes: 110,
    },
    {
      qid: "q2",
      title:
        "How can I help my 5-year-old manage tantrums when it’s time to leave the playground?",
      age: "5 yrs",
      replies: 67,
      likes: 198,
    },
  ];
  const children = [
    { id: "c1", nickname: "Nickname-1", age: "5" },
    { id: "c2", nickname: "Nickname-2", age: "2" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Left column-ish header */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#e5e7eb",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 52 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: "800" }}>
                {displayName}
              </Text>
              <Text style={{ color: "#6b7280", marginBottom: 8 }}>@{handle}</Text>
              <Text style={{ color: "#374151" }}>
                Single mom of 2, enjoys cooking and watching rom-coms
              </Text>
              <Pressable
                style={{
                  alignSelf: "flex-start",
                  marginTop: 12,
                  backgroundColor: "#111827",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>
                  Add Friend
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Questions */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800" }}>Questions</Text>
            <Pressable
              style={{ marginLeft: "auto" }}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={{ color: "#4f46e5", fontWeight: "700" }}>
                See more
              </Text>
            </Pressable>
          </View>

          {questions.map((q) => (
            <Pressable
              key={q.qid}
              onPress={() =>
                navigation.navigate("QuestionDetail", { qid: q.qid })
              }
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 12,
                padding: 12,
                marginTop: 10,
              }}
            >
              <Text style={{ fontWeight: "800", marginBottom: 6 }}>
                {q.title}
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View
                  style={{
                    backgroundColor: "#e5e7eb",
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{q.age}</Text>
                </View>
                <Text style={{ color: "#6b7280" }}>💬 {q.replies}</Text>
                <Text style={{ color: "#6b7280" }}>🤍 {q.likes}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Children */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 10 }}>
            Children
          </Text>
          <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
            {children.map((c) => (
              <View
                key={c.id}
                style={{
                  width: 260,
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#e5e7eb",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontSize: 30 }}>👶</Text>
                </View>
                <Text style={{ fontWeight: "800" }}>Nickname-{c.id === "c1" ? "1" : "2"}</Text>
                <Text style={{ color: "#6b7280" }}>Age: {c.age}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
