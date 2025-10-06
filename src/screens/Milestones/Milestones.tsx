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
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
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

function isChildRecord(item: any): boolean {
  return (
    typeof item?.SK === "string" &&
    item.SK.startsWith("CHILD#") &&
    item.SK.split("#").length === 2
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayString = () => {
  const d = new Date();
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

export default function MilestonesScreen({ navigation }: any) {
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Growth fields
  const [growthDate, setGrowthDate] = useState(new Date());
  const [showGrowthPicker, setShowGrowthPicker] = useState(false);
  const [growthHeight, setGrowthHeight] = useState("");
  const [growthWeight, setGrowthWeight] = useState("");

  // Vaccine fields
  const [vaccineName, setVaccineName] = useState("");
  const [vaccineDate, setVaccineDate] = useState(new Date());
  const [showVaccinePicker, setShowVaccinePicker] = useState(false);
  const [vaccineStatus, setVaccineStatus] = useState<"done" | "pending" | "skipped">("pending");

  useEffect(() => {
    const loadKids = async () => {
      try {
        const kids = await listChildren();
        const filtered = kids.filter(isChildRecord);
        setChildren(filtered);
        if (filtered.length > 0 && !childId) setChildId(filtered[0].child_id);
      } catch (err) {
        console.error("Failed to load children:", err);
      }
    };
    loadKids();
  }, []);

  const loadData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const [m, g, v] = await Promise.all([
        listMilestones(childId),
        listGrowth(childId),
        listVaccines(childId),
      ]);

      const gItems = Array.isArray((g as any)?.items)
        ? (g as any).items
        : Array.isArray(g)
        ? g
        : [];
      const vItems = Array.isArray((v as any)?.items)
        ? (v as any).items
        : Array.isArray(v)
        ? v
        : [];

      setMilestones(Array.isArray(m) ? m : []);
      setGrowthRecords(gItems);
      setVaccines(vItems);
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

  const handleToggleMilestone = async (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
    try {
      await toggleMilestone(childId as string, id);
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
    }
  };

  const handleAddGrowth = async () => {
    if (!growthHeight || !growthWeight || !childId) return;
    try {
      const newRec = await addGrowth(childId, {
        date: todayString(),
        height: parseFloat(growthHeight),
        weight: parseFloat(growthWeight),
      });
      setGrowthRecords((prev) => [...prev, newRec]);
      setGrowthHeight("");
      setGrowthWeight("");
      setGrowthDate(new Date());
    } catch (err) {
      console.error("Failed to add growth record:", err);
    }
  };

  const handleAddVaccine = async () => {
    if (!vaccineName || !childId) return;
    try {
      const newRec = await addVaccine(childId, {
        name: vaccineName,
        date: todayString(),
        status: vaccineStatus,
      });
      setVaccines((prev) => [...prev, newRec]);
      setVaccineName("");
      setVaccineDate(new Date());
      setVaccineStatus("pending");
    } catch (err) {
      console.error("Failed to add vaccine record:", err);
    }
  };

  const handleAskBibi = (presetText: string) => {
    navigation.navigate("BiBi", { preset: presetText, autoSend: true });
  };

  const onGrowthDateChange = (e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowGrowthPicker(false);
    if (selected) setGrowthDate(selected);
  };

  const onVaccineDateChange = (e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowVaccinePicker(false);
    if (selected) setVaccineDate(selected);
  };

  if (loading)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.aqua.dark} />
      </View>
    );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base.background }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
      }
    >
      {/* ---------- Child Selector ---------- */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16, gap: 8 }}>
        {children.map((child) => (
          <Pressable
            key={child.child_id}
            onPress={() => setChildId(child.child_id)}
            style={{
              backgroundColor: childId === child.child_id ? colors.aqua.dark : colors.aqua.light,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: childId === child.child_id ? "white" : colors.aqua.text,
                fontWeight: "700",
              }}
            >
              {child.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ---------- Milestones + BiBi ---------- */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {/* Milestones Grid */}
        <View style={{ flex: 3 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.aqua.text, marginBottom: 8 }}>
            Milestones
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {milestones.map((m) => (
              <Pressable
                key={m.id}
                onPress={() => handleToggleMilestone(m.id)}
                style={{
                  backgroundColor: colors.aqua.light,
                  borderRadius: 12,
                  padding: 12,
                  width: "48%",
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: m.done ? colors.aqua.dark : colors.base.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700", color: colors.aqua.text, textAlign: "center" }}>
                  {m.name}
                </Text>
                {!!m.typical && (
                  <Text style={{ fontSize: 12, color: colors.base.muted, textAlign: "center", marginTop: 4 }}>
                    {m.typical}
                  </Text>
                )}
                {/* Checkbox */}
                <View
                  style={{
                    marginTop: 10,
                    width: 24,
                    height: 24,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderColor: m.done ? colors.aqua.dark : colors.base.border,
                    backgroundColor: m.done ? colors.aqua.dark : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {m.done && <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>✓</Text>}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Ask BiBi */}
        <View
          style={{
            flex: 1.2,
            backgroundColor: colors.peach.light,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.base.border,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.peach.text, marginBottom: 8 }}>
            💬 Ask BiBi
          </Text>
          <Text style={{ fontSize: 14, color: colors.peach.subtext, marginBottom: 10, lineHeight: 20 }}>
            Curious about what milestones your child should reach soon?
          </Text>
          <Pressable
            onPress={() =>
              handleAskBibi("Hi BiBi, can you tell me what milestones my child should be reaching around this age?")
            }
            style={{
              backgroundColor: colors.peach.dark,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Ask BiBi about milestones</Text>
          </Pressable>
        </View>
      </View>

      {/* ---------- Growth + Vaccine side by side ---------- */}
      <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start", justifyContent: "space-between" }}>
        {/* Growth Tracker */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.peach.text, marginBottom: 8 }}>
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
              <Text style={{ fontWeight: "700", color: colors.peach.text }}>{g.date}</Text>
              <Text>
                {g.height} cm • {g.weight} kg
              </Text>
            </View>
          ))}

          {/* Add Growth Form */}
          <View style={{ marginTop: 8, gap: 8 }}>
            {Platform.OS === "web" ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  borderRadius: 6,
                  backgroundColor: "#f4f4f4",
                  height: 44,
                  justifyContent: "center",
                  paddingHorizontal: 8,
                }}
              >
                {/* @ts-ignore */}
                <input
                  type="date"
                  value={toYMD(growthDate)}
                  max={toYMD(new Date())}
                  onChange={(e: any) => {
                    const [yy, mm, dd] = e.target.value.split("-").map(Number);
                    setGrowthDate(new Date(yy, mm - 1, dd));
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 15,
                    color: colors.base.text,
                  }}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowGrowthPicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.base.border,
                    borderRadius: 6,
                    backgroundColor: "#f4f4f4",
                    paddingHorizontal: 12,
                    height: 44,
                    justifyContent: "center",
                  }}
                >
                  <Text>{todayString()}</Text>
                </TouchableOpacity>
                {showGrowthPicker && (
                  <DateTimePicker
                    value={growthDate}
                    mode="date"
                    display="calendar"
                    onChange={onGrowthDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}

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
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add Growth Record</Text>
            </Pressable>
          </View>
        </View>

        {/* Vaccine Tracker */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.peach.text, marginBottom: 8 }}>
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
              <Text style={{ fontWeight: "700", color: colors.peach.text }}>{v.name}</Text>
              <Text style={{ fontSize: 12, color: colors.base.muted }}>{v.date}</Text>
              <Text style={{ fontSize: 13 }}>Status: {v.status}</Text>
            </View>
          ))}

          {/* Add Vaccine Form */}
          <View style={{ marginTop: 8, gap: 8 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.base.border,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <Picker selectedValue={vaccineName} onValueChange={(value) => setVaccineName(value)}>
                <Picker.Item label="Select Vaccine" value="" />
                <Picker.Item label="Hepatitis B (Hep-B)" value="Hepatitis B" />
                <Picker.Item label="BCG (Tuberculosis)" value="BCG" />
                <Picker.Item label="Pneumococcal (KPA)" value="Pneumococcal" />
                <Picker.Item label="DTP-Polio-Hib-HepB" value="DaBT-IPA-Hib-HepB" />
                <Picker.Item label="Oral Polio (OPA)" value="Oral Polio" />
                <Picker.Item label="Varicella (Chickenpox)" value="Varicella" />
                <Picker.Item label="MMR (Measles-Mumps-Rubella)" value="MMR" />
                <Picker.Item label="Hepatitis A (Hep-A)" value="Hepatitis A" />
                <Picker.Item label="DTP-Polio Booster" value="DTP-Polio Booster" />
                <Picker.Item label="Tetanus-Diphtheria (Td)" value="Tetanus-Diphtheria" />
                <Picker.Item label="Influenza (Flu)" value="Influenza" />
              </Picker>
            </View>

            {Platform.OS === "web" ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  borderRadius: 6,
                  backgroundColor: "#f4f4f4",
                  height: 44,
                  justifyContent: "center",
                  paddingHorizontal: 8,
                }}
              >
                {/* @ts-ignore */}
                <input
                  type="date"
                  value={toYMD(vaccineDate)}
                  max={toYMD(new Date())}
                  onChange={(e: any) => {
                    const [yy, mm, dd] = e.target.value.split("-").map(Number);
                    setVaccineDate(new Date(yy, mm - 1, dd));
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 15,
                    color: colors.base.text,
                  }}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowVaccinePicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.base.border,
                    borderRadius: 6,
                    backgroundColor: "#f4f4f4",
                    paddingHorizontal: 12,
                    height: 44,
                    justifyContent: "center",
                  }}
                >
                  <Text>{todayString()}</Text>
                </TouchableOpacity>
                {showVaccinePicker && (
                  <DateTimePicker
                    value={vaccineDate}
                    mode="date"
                    display="calendar"
                    onChange={onVaccineDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}

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
                onValueChange={(value) => setVaccineStatus(value as "done" | "pending" | "skipped")}
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
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add Vaccine Record</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
