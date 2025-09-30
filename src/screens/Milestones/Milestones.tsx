// src/screens/Milestones/Milestones.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  getMyProfile,
  listMilestones,
  toggleMilestone,
  listGrowth,
  addGrowth,
  listVaccines,
  addVaccine,
  Child,
  Milestone,
  GrowthRecord,
  VaccineRecord,
} from "../../services/profile";
import colors from "../../styles/colors";

// helper to format today as DD-MM-YYYY
const todayString = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function Milestones() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const childId = route.params?.childId || null;

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // form states
  const [growthDate, setGrowthDate] = useState(todayString());
  const [growthHeight, setGrowthHeight] = useState("");
  const [growthWeight, setGrowthWeight] = useState("");

  const [vaccineName, setVaccineName] = useState("");
  const [vaccineDate, setVaccineDate] = useState(todayString());
  const [vaccineStatus, setVaccineStatus] = useState<"done" | "pending" | "skipped">("pending");

  // -------- Load children --------
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const profile = await getMyProfile();
        const kids = profile.children || [];
        setChildren(kids);

        if (!childId && kids.length > 0) {
          navigation.navigate("Milestones", { childId: kids[0].id });
        }
      } catch (err) {
        console.error("Network error (children):", err);
      }
    };

    loadChildren();
  }, []);

  // -------- Load trackers --------
  useEffect(() => {
    if (!childId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [mData, gData, vData] = await Promise.all([
          listMilestones(childId),
          listGrowth(childId),
          listVaccines(childId),
        ]);
        setMilestones(mData.items || []);
        setGrowthRecords(gData.items || []);
        setVaccines(vData.items || []);
      } catch (err) {
        console.error("Network error (tracking):", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [childId]);

  // -------- Toggle milestone --------
  const toggleDone = async (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
    try {
      await toggleMilestone(childId as string, id);
    } catch (err) {
      console.error("Failed to update milestone:", err);
    }
  };

  // -------- Add growth --------
  const handleAddGrowth = async () => {
    if (!growthHeight || !growthWeight) return;
    try {
      const newRec = await addGrowth(childId, {
        date: growthDate,
        height: parseFloat(growthHeight),
        weight: parseFloat(growthWeight),
      });
      setGrowthRecords((prev) => [...prev, newRec]);
      setGrowthDate(todayString());
      setGrowthHeight("");
      setGrowthWeight("");
    } catch (err) {
      console.error("Failed to add growth:", err);
    }
  };

  // -------- Add vaccine --------
  const handleAddVaccine = async () => {
    if (!vaccineName) return;
    try {
      const newRec = await addVaccine(childId, {
        name: vaccineName,
        date: vaccineDate,
        status: vaccineStatus,
      });
      setVaccines((prev) => [...prev, newRec]);
      setVaccineName("");
      setVaccineDate(todayString());
      setVaccineStatus("pending");
    } catch (err) {
      console.error("Failed to add vaccine:", err);
    }
  };

  // -------- Switch child --------
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
          {/* LEFT: All trackers */}
          <View style={{ flex: 1 }}>
            {/* Milestones */}
            <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12, color: colors.aqua.text }}>
              Milestone Tracker
            </Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.aqua.dark} />
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {milestones.map((m) => (
                  <Pressable key={m.id} onPress={() => toggleDone(m.id)}
                    style={{
                      backgroundColor: colors.aqua.light,
                      borderRadius: 16,
                      padding: 16,
                      width: "30%",
                      minWidth: 160,
                      borderWidth: 1,
                      borderColor: m.done ? colors.aqua.dark : colors.base.border,
                    }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4, color: colors.aqua.text }}>
                      {m.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.base.text }}>
                      Typical: {m.typical}
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 18, textAlign: "center" }}>
                      {m.done ? "☑" : "☐"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Growth Records */}
            <Text style={{ fontSize: 22, fontWeight: "800", marginVertical: 16, color: colors.peach.text }}>
              Growth Tracker
            </Text>
            {growthRecords.map((g) => (
              <View key={g.id} style={{
                padding: 12, backgroundColor: colors.peach.light,
                borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.base.border,
              }}>
                <Text style={{ fontWeight: "700", color: colors.peach.text }}>{g.date}</Text>
                <Text>{g.height} cm • {g.weight} kg</Text>
              </View>
            ))}
            {/* Add growth form */}
            <View style={{ marginTop: 8, gap: 8 }}>
              <TextInput placeholder="Date" value={growthDate} editable={false}
                style={{ borderWidth: 1, borderColor: colors.base.border, borderRadius: 6, padding: 8, backgroundColor: "#f4f4f4" }} />
              <TextInput placeholder="Height (cm)" value={growthHeight} onChangeText={setGrowthHeight}
                keyboardType="numeric" style={{ borderWidth: 1, borderColor: colors.base.border, borderRadius: 6, padding: 8 }} />
              <TextInput placeholder="Weight (kg)" value={growthWeight} onChangeText={setGrowthWeight}
                keyboardType="numeric" style={{ borderWidth: 1, borderColor: colors.base.border, borderRadius: 6, padding: 8 }} />
              <Pressable onPress={handleAddGrowth}
                style={{ backgroundColor: colors.peach.dark, padding: 10, borderRadius: 6, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Add Growth Record</Text>
              </Pressable>
            </View>

            {/* Vaccine Records */}
            <Text style={{ fontSize: 22, fontWeight: "800", marginVertical: 16, color: colors.peach.text }}>
              Vaccine Tracker
            </Text>
            {vaccines.map((v) => (
              <View key={v.id} style={{
                backgroundColor: colors.peach.light,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.base.border,
              }}>
                <Text style={{ fontWeight: "700", color: colors.peach.text }}>{v.name}</Text>
                <Text style={{ fontSize: 12, color: colors.base.muted }}>{v.date}</Text>
                <Text style={{ fontSize: 13 }}>Status: {v.status}</Text>
              </View>
            ))}
            {/* Add vaccine form */}
            <View style={{ marginTop: 8, gap: 8 }}>
              <TextInput placeholder="Vaccine Name" value={vaccineName} onChangeText={setVaccineName}
                style={{ borderWidth: 1, borderColor: colors.base.border, borderRadius: 6, padding: 8 }} />
              <TextInput placeholder="Date" value={vaccineDate} editable={false}
                style={{ borderWidth: 1, borderColor: colors.base.border, borderRadius: 6, padding: 8, backgroundColor: "#f4f4f4" }} />
              <TextInput placeholder="Status (done/pending/skipped)" value={vaccineStatus}
                onChangeText={(t) => setVaccineStatus(t as any)}
                style={{ borderWidth: 1, borderColor: colors.base.border, borderRadius: 6, padding: 8 }} />
              <Pressable onPress={handleAddVaccine}
                style={{ backgroundColor: colors.peach.dark, padding: 10, borderRadius: 6, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Add Vaccine Record</Text>
              </Pressable>
            </View>
          </View>

          {/* RIGHT: Child selector */}
          <View style={{ width: isWide ? 220 : "100%", gap: 12 }}>
            {children.map((child) => (
              <Pressable key={child.id} onPress={() => switchChild(child.id)}
                style={{
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: childId === child.id ? colors.peach.dark : colors.peach.light,
                }}>
                <Text style={{
                  color: childId === child.id ? "#fff" : colors.peach.text,
                  fontWeight: "700",
                }}>
                  {child.name}
                </Text>
              </Pressable>
            ))}

            {/* Ask Bibi button with preset prompt */}
            <Pressable
              onPress={() =>
                navigation.navigate("Bibi", {
                  preset: "Hi Bibi, whats the milestones my child should be hitting?",
                })
              }
              style={{
                marginTop: 8,
                alignSelf: "flex-start",
                backgroundColor: colors.peach.dark,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Ask Bibi</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
