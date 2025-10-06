// src/screens/Milestones/Milestones.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import {
  listChildren,
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
import { Picker } from "@react-native-picker/picker";

// Helper: filter only actual child records
function isChildRecord(item: any): boolean {
  return (
    typeof item?.SK === "string" &&
    item.SK.startsWith("CHILD#") &&
    item.SK.split("#").length === 2
  );
}

// Format today's date (DD-MM-YYYY)
const todayString = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
};

export default function MilestonesScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<string | null>(null);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [growthDate, setGrowthDate] = useState(todayString());
  const [growthHeight, setGrowthHeight] = useState("");
  const [growthWeight, setGrowthWeight] = useState("");
  const [vaccineName, setVaccineName] = useState("");
  const [vaccineDate, setVaccineDate] = useState(todayString());
  const [vaccineStatus, setVaccineStatus] = useState<
    "done" | "pending" | "skipped"
  >("pending");

  // ---------- Load children ----------
  useEffect(() => {
    const loadKids = async () => {
      try {
        const kids = await listChildren();
        const filtered = kids.filter(isChildRecord);
        setChildren(filtered);
        if (filtered.length > 0 && !childId) {
          setChildId(filtered[0].child_id);
        }
      } catch (err) {
        console.error("Failed to load children:", err);
      }
    };
    loadKids();
  }, []);

  // ---------- Load milestones, growth, and vaccines ----------
  const loadData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const [m, g, v] = await Promise.all([
        listMilestones(childId),
        listGrowth(childId),
        listVaccines(childId),
      ]);

      const gAny = g as any;
      const vAny = v as any;

      const growthItems = Array.isArray(gAny)
        ? gAny
        : Array.isArray(gAny?.Items)
        ? gAny.Items
        : Array.isArray(gAny?.items)
        ? gAny.items
        : [];

      const vaccineItems = Array.isArray(vAny)
        ? vAny
        : Array.isArray(vAny?.Items)
        ? vAny.Items
        : Array.isArray(vAny?.items)
        ? vAny.items
        : [];

      setMilestones(Array.isArray(m) ? m : []);
      setGrowthRecords(growthItems);
      setVaccines(vaccineItems);
    } catch (err) {
      console.error("Failed to load trackers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [childId]);

  useEffect(() => {
    loadData();
  }, [childId, loadData]);

  // ---------- Toggle milestone ----------
  const handleToggleMilestone = async (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
    try {
      await toggleMilestone(childId as string, id);
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
      setMilestones((prev) =>
        prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
      );
    }
  };

  // ---------- Add growth ----------
  const handleAddGrowth = async () => {
    if (!growthHeight || !growthWeight || !childId) return;
    try {
      const newRec = await addGrowth(childId, {
        date: growthDate,
        height: parseFloat(growthHeight),
        weight: parseFloat(growthWeight),
      });
      setGrowthRecords((prev) => [...prev, newRec]);
      setGrowthHeight("");
      setGrowthWeight("");
      setGrowthDate(todayString());
    } catch (err) {
      console.error("Failed to add growth record:", err);
    }
  };

  // ---------- Add vaccine ----------
  const handleAddVaccine = async () => {
    if (!vaccineName || !childId) return;
    try {
      const newRec = await addVaccine(childId, {
        name: vaccineName,
        date: vaccineDate,
        status: vaccineStatus,
      });
      setVaccines((prev) => [...prev, newRec]);
      setVaccineName("");
      setVaccineStatus("pending");
      setVaccineDate(todayString());
    } catch (err) {
      console.error("Failed to add vaccine record:", err);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.aqua.dark} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base.background }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData();
          }}
        />
      }
    >
      {/* ---------- Child Selector ---------- */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 16,
          gap: 8,
        }}
      >
        {children.map((child) => (
          <Pressable
            key={child.child_id}
            onPress={() => setChildId(child.child_id)}
            style={{
              backgroundColor:
                childId === child.child_id
                  ? colors.aqua.dark
                  : colors.aqua.light,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color:
                  childId === child.child_id ? "white" : colors.aqua.text,
                fontWeight: "700",
              }}
            >
              {child.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ---------- Milestones ---------- */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: colors.aqua.text,
            marginBottom: 8,
          }}
        >
          Milestones
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {milestones.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => handleToggleMilestone(m.id)}
              style={{
                backgroundColor: colors.aqua.light,
                borderRadius: 12,
                padding: 12,
                width: "23%",
                marginBottom: 12,
                borderWidth: 2,
                borderColor: m.done
                  ? colors.aqua.dark
                  : colors.base.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: colors.aqua.text,
                  textAlign: "center",
                }}
              >
                {m.name}
              </Text>

              {!!m.typical && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.base.muted,
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  {m.typical}
                </Text>
              )}

              <View
                style={{
                  marginTop: 10,
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderRadius: 6,
                  borderColor: m.done
                    ? colors.aqua.dark
                    : colors.base.border,
                  backgroundColor: m.done
                    ? colors.aqua.dark
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {m.done && (
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 16,
                      marginTop: -2,
                    }}
                  >
                    ✓
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ---------- Growth Tracker ---------- */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: colors.peach.text,
            marginBottom: 8,
          }}
        >
          Growth Tracker
        </Text>

        {growthRecords.map((g, idx) => (
          <View
            key={`${g.date}-${idx}`}
            style={{
              padding: 12,
              backgroundColor: colors.peach.light,
              borderRadius: 8,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: colors.base.border,
            }}
          >
            <Text style={{ fontWeight: "700", color: colors.peach.text }}>
              {g.date}
            </Text>
            <Text>
              {g.height} cm • {g.weight} kg
            </Text>
          </View>
        ))}

        {/* Add growth form */}
        <View style={{ marginTop: 8, gap: 8 }}>
          <TextInput
            placeholder="Date"
            value={growthDate}
            editable={false}
            style={{
              borderWidth: 1,
              borderColor: colors.base.border,
              borderRadius: 6,
              padding: 8,
              backgroundColor: "#f4f4f4",
            }}
          />
          <TextInput
            placeholder="Height (cm)"
            value={growthHeight}
            onChangeText={setGrowthHeight}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: colors.base.border,
              borderRadius: 6,
              padding: 8,
            }}
          />
          <TextInput
            placeholder="Weight (kg)"
            value={growthWeight}
            onChangeText={setGrowthWeight}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: colors.base.border,
              borderRadius: 6,
              padding: 8,
            }}
          />
          <Pressable
            onPress={handleAddGrowth}
            style={{
              backgroundColor: colors.peach.dark,
              padding: 10,
              borderRadius: 6,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Add Growth Record
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ---------- Vaccine Tracker ---------- */}
      <View>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: colors.peach.text,
            marginBottom: 8,
          }}
        >
          Vaccine Tracker
        </Text>

        {vaccines.map((v, idx) => (
          <View
            key={`${v.name}-${v.date}-${idx}`}
            style={{
              backgroundColor: colors.peach.light,
              borderRadius: 12,
              padding: 12,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: colors.base.border,
            }}
          >
            <Text style={{ fontWeight: "700", color: colors.peach.text }}>
              {v.name}
            </Text>
            <Text style={{ fontSize: 12, color: colors.base.muted }}>
              {v.date}
            </Text>
            <Text style={{ fontSize: 13 }}>Status: {v.status}</Text>
          </View>
        ))}

        {/* Add vaccine form */}
        <View style={{ marginTop: 8, gap: 8 }}>
          {/* Vaccine Name Dropdown */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.base.border,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <Picker
              selectedValue={vaccineName}
              onValueChange={(value) => setVaccineName(value)}
            >
              <Picker.Item label="Select Vaccine" value="" />
              <Picker.Item
                label="Hepatitis B (Hep-B)"
                value="Hepatitis B"
              />
              <Picker.Item label="BCG (Tuberculosis)" value="BCG" />
              <Picker.Item
                label="Pneumococcal (KPA)"
                value="Pneumococcal"
              />
              <Picker.Item
                label="DTP-Polio-Hib-HepB"
                value="DaBT-IPA-Hib-HepB"
              />
              <Picker.Item
                label="Oral Polio (OPA)"
                value="Oral Polio"
              />
              <Picker.Item
                label="Varicella (Chickenpox)"
                value="Varicella"
              />
              <Picker.Item
                label="MMR (Measles-Mumps-Rubella)"
                value="MMR"
              />
              <Picker.Item label="Hepatitis A (Hep-A)" value="Hepatitis A" />
              <Picker.Item
                label="DTP-Polio Booster"
                value="DTP-Polio Booster"
              />
              <Picker.Item
                label="Tetanus-Diphtheria (Td)"
                value="Tetanus-Diphtheria"
              />
              <Picker.Item label="Influenza (Flu)" value="Influenza" />
            </Picker>
          </View>

          {/* Date */}
          <TextInput
            placeholder="Date"
            value={vaccineDate}
            editable={false}
            style={{
              borderWidth: 1,
              borderColor: colors.base.border,
              borderRadius: 6,
              padding: 8,
              backgroundColor: "#f4f4f4",
            }}
          />

          {/* Vaccine Status Dropdown */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.base.border,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <Picker
              selectedValue={vaccineStatus}
              onValueChange={(value) =>
                setVaccineStatus(value as "done" | "pending" | "skipped")
              }
            >
              <Picker.Item label="Pending" value="pending" />
              <Picker.Item label="Done" value="done" />
              <Picker.Item label="Skipped" value="skipped" />
            </Picker>
          </View>

          <Pressable
            onPress={handleAddVaccine}
            style={{
              backgroundColor: colors.peach.dark,
              padding: 10,
              borderRadius: 6,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Add Vaccine Record
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
