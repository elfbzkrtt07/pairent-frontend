// src/screens/Milestones/Milestones.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { fetchAuthSession } from "aws-amplify/auth";
import colors from "../../styles/colors";

type Milestone = {
  id: string;
  name: string;
  typical: string;
  done: boolean;
};

type Child = {
  id: string;
  name: string;
};

export default function Milestones() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const childId = route.params?.childId || null;

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch children from backend
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        const res = await fetch("http://localhost:5000/profile/children", {
          headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
        });

        if (!res.ok) {
          console.error("Failed to load children", res.status);
          return;
        }

        const data = await res.json();
        setChildren(data.items || []);

        // default child if none selected
        if (!childId && data.items.length > 0) {
          navigation.navigate("Milestones", { childId: data.items[0].id });
        }
      } catch (err) {
        console.error("Network error (children):", err);
      }
    };

    loadChildren();
  }, []);

  // fetch milestones for selected child
  useEffect(() => {
    if (!childId) return;

    const loadMilestones = async () => {
      try {
        setLoading(true);

        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        const res = await fetch(
          `http://localhost:5000/milestones/${childId}`,
          {
            headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
          }
        );

        if (!res.ok) {
          console.error("Failed to load milestones", res.status);
          return;
        }

        const data = await res.json();
        setMilestones(data.items || []);
      } catch (err) {
        console.error("Network error (milestones):", err);
      } finally {
        setLoading(false);
      }
    };

    loadMilestones();
  }, [childId]);

  const toggleDone = async (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );

    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      await fetch(`http://localhost:5000/milestones/${childId}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: JSON.stringify({ toggle: true }),
      });
    } catch (err) {
      console.error("Failed to update milestone:", err);
    }
  };

  const switchChild = (child: string) => {
    navigation.navigate("Milestones", { childId: child });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.base.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            gap: 16,
            alignItems: "flex-start",
            maxWidth: 1200,
            alignSelf: "center",
            width: "100%",
            flex: 1,
          }}
        >
          {/* LEFT: Milestones grid */}
          <View style={{ flex: 1 }}>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  marginBottom: 4,
                  color: colors.aqua.text,
                  textAlign: "center",
                }}
              >
                Milestone Tracker
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.base.text,
                  textAlign: "center",
                }}
              >
                Follow your child’s growth and see what’s next.
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.aqua.dark} />
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {milestones.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => toggleDone(m.id)}
                    style={{
                      backgroundColor: colors.aqua.light,
                      borderRadius: 16,
                      padding: 16,
                      width: "30%",
                      minWidth: 160,
                      borderWidth: 1,
                      borderColor: m.done
                        ? colors.aqua.dark
                        : colors.base.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        marginBottom: 4,
                        color: colors.aqua.text,
                      }}
                    >
                      {m.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.base.text }}>
                      Typical: {m.typical}
                    </Text>
                    <Text
                      style={{
                        marginTop: 8,
                        fontSize: 18,
                        textAlign: "center",
                      }}
                    >
                      {m.done ? "☑" : "☐"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Ask Bibi (bottom-right corner) */}
            <View style={{ alignItems: "flex-end", marginTop: 20 }}>
              <Pressable
                onPress={() => navigation.navigate("Bibi")}
                style={{
                  backgroundColor: colors.peach.dark,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Ask Bibi</Text>
              </Pressable>
            </View>
          </View>

          {/* RIGHT: Child selector */}
          <View style={{ width: isWide ? 220 : "100%", gap: 12 }}>
            {children.map((child) => (
              <Pressable
                key={child.id}
                onPress={() => switchChild(child.id)}
                style={{
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor:
                    childId === child.id ? colors.peach.dark : colors.peach.light,
                }}
              >
                <Text
                  style={{
                    color: childId === child.id ? "#fff" : colors.peach.text,
                    fontWeight: "700",
                  }}
                >
                  {child.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
