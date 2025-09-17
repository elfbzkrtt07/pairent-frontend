// src/screens/Timers/Timers.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  useWindowDimensions,
  Image,
  Vibration,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";

/* ---------- helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");

const formatHMS = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(ss)}`;
};

const formatTotalHM = (ms: number) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
};

const toMs = (hh: string, mm: string) => {
  const h = Math.max(0, parseInt(hh || "0", 10) || 0);
  const m = Math.max(0, parseInt(mm || "0", 10) || 0);
  return h * 3600000 + m * 60000;
};

/* ---------- screen ---------- */
export default function Timers({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;

  // Defaults
  const DEFAULT_NAPPY_MS = 2 * 60 * 60 * 1000;   // 02:00:00
  const DEFAULT_FOOD_MS  = 4.5 * 60 * 60 * 1000; // 04:30:00

  // Totals (Summary shows these)
  const [nappyTotalMs, setNappyTotalMs] = useState(DEFAULT_NAPPY_MS);
  const [foodTotalMs, setFoodTotalMs]   = useState(DEFAULT_FOOD_MS);

  // Remaining + running
  const [nappyRemainingMs, setNappyRemainingMs] = useState(DEFAULT_NAPPY_MS);
  const [foodRemainingMs, setFoodRemainingMs]   = useState(DEFAULT_FOOD_MS);
  const [nappyRunning, setNappyRunning] = useState(false);
  const [foodRunning, setFoodRunning]   = useState(false);

  // NEW: statuses
  const [nappyStatus, setNappyStatus] = useState<"Asleep" | "Awake">("Awake");
  const [foodStatus, setFoodStatus]   = useState<"Hungry" | "Full">("Hungry");

  // One shared tick
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nappyAlertedRef = useRef(false);
  const foodAlertedRef = useRef(false);

  // Notifications setup
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const requestPermissions = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }
      } catch (e) {
        // ignore permission errors; best-effort
      }
    };
    requestPermissions();
  }, []);

  const triggerAlarm = async (title: string, body: string) => {
    try {
      if (Platform.OS !== "web") {
        await Notifications.presentNotificationAsync({
          title,
          body,
          sound: "default",
        });
        Vibration.vibrate(800);
      }
    } catch (e) {
      // noop
    }
  };

  useEffect(() => {
    const anyRunning = nappyRunning || foodRunning;

    if (anyRunning && !tickRef.current) {
      tickRef.current = setInterval(() => {
        setNappyRemainingMs(prev => {
          if (!nappyRunning) return prev;
          const next = Math.max(0, prev - 1000);
          if (next === 0) {
            setNappyRunning(false);
            if (!nappyAlertedRef.current) {
              nappyAlertedRef.current = true;
              triggerAlarm("Nappy timer finished", "Time to check the nappy.");
            }
          }
          return next;
        });
        setFoodRemainingMs(prev => {
          if (!foodRunning) return prev;
          const next = Math.max(0, prev - 1000);
          if (next === 0) {
            setFoodRunning(false);
            if (!foodAlertedRef.current) {
              foodAlertedRef.current = true;
              triggerAlarm("Food timer finished", "Feeding time reminder.");
            }
          }
          return next;
        });
      }, 1000);
    }

    if (!anyRunning && tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [nappyRunning, foodRunning]);

  // Start/Reset
  const onToggleNappy = () => {
    if (!nappyRunning) {
      setNappyRunning(true);
      nappyAlertedRef.current = false;
    } else {
      setNappyRunning(false);
      setNappyRemainingMs(nappyTotalMs);
      nappyAlertedRef.current = false;
    }
  };

  const onToggleFood = () => {
    if (!foodRunning) {
      setFoodRunning(true);
      foodAlertedRef.current = false;
    } else {
      setFoodRunning(false);
      setFoodRemainingMs(foodTotalMs);
      foodAlertedRef.current = false;
    }
  };

  // NEW: status toggles
  const toggleNappyStatus = () =>
    setNappyStatus((s) => (s === "Asleep" ? "Awake" : "Asleep"));

  const toggleFoodStatus = () =>
    setFoodStatus((s) => (s === "Hungry" ? "Full" : "Hungry"));

  /* ---------- Edit modal (changes TOTAL duration; resets timers) ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [nH, setNH] = useState("2");
  const [nM, setNM] = useState("0");
  const [fH, setFH] = useState("4");
  const [fM, setFM] = useState("30");

  const openEdit = () => {
    setNH(String(Math.floor(nappyTotalMs / 3600000)));
    setNM(String(Math.floor((nappyTotalMs % 3600000) / 60000)));
    setFH(String(Math.floor(foodTotalMs / 3600000)));
    setFM(String(Math.floor((foodTotalMs % 3600000) / 60000)));
    setEditOpen(true);
  };

  const applyEdit = () => {
    const newNappy = Math.max(1, toMs(nH, nM));
    const newFood  = Math.max(1, toMs(fH, fM));

    setNappyTotalMs(newNappy);
    setFoodTotalMs(newFood);

    // Reset & stop to reflect new totals
    setNappyRunning(false);
    setFoodRunning(false);
    setNappyRemainingMs(newNappy);
    setFoodRemainingMs(newFood);
    nappyAlertedRef.current = false;
    foodAlertedRef.current = false;

    setEditOpen(false);
  };

  /* ---------- UI ---------- */
  const CARD_HEIGHT = 360;
  const CIRCLE_SIZE = 240;

  const DarkBtn = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#0f172a",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        minWidth: 110,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );

  const Card = ({
    title,
    timeText,
    subText,
    primaryLabel,
    onPrimary,
    statusLabel,
    onStatus,
    icon,
    iconSize,
  }: {
    title: string;
    timeText: string;
    subText: string;
    primaryLabel: "Start" | "Reset";
    onPrimary: () => void;
    statusLabel: string;       // e.g., "Asleep" | "Awake" | "Hungry" | "Full"
    onStatus: () => void;
    icon?: any;
    iconSize?: number;
  }) => (
    <View
      style={{
        backgroundColor: "#ececec",
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 18,
        height: isWide ? undefined : CARD_HEIGHT,
        flexGrow: 1,
        minWidth: 420,
        flex: isWide ? 1 : undefined,
        alignSelf: "stretch",
      }}
    >
      {icon ? (
        <Image
          source={icon}
          style={{
            width: iconSize ?? 40,
            height: iconSize ?? 40,
            alignSelf: "center",
            marginBottom: 6,
            resizeMode: "contain",
          }}
        />
      ) : null}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            borderColor: "#a3a3a3",
            borderWidth: 10,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: subText ? 10 : 0,
          }}
        >
          <Text style={{ fontSize: 36, fontWeight: "800", letterSpacing: 1 }}>
            {timeText}
          </Text>
        </View>

        {subText ? (
          <Text style={{ textAlign: "center", color: "#4b5563", marginBottom: 14 }}>
            {subText}
          </Text>
        ) : null}
      </View>

      <View style={{ alignItems: "center" }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <DarkBtn label={primaryLabel} onPress={onPrimary} />
          <DarkBtn label={statusLabel} onPress={onStatus} />
        </View>
      </View>
    </View>
  );

  const foodSub = useMemo(
    () => "",
    [foodRunning]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f7f9" }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: 32 }}>
        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            gap: 32,
            alignItems: "stretch",
            justifyContent: "flex-start",
            flex: 1,
          }}
        >
          {/* Nappy */}
          <Card
            title="Nappy Timer"
            timeText={formatHMS(nappyRemainingMs)}
            subText={""}
            primaryLabel={nappyRunning ? "Reset" : "Start"}
            onPrimary={onToggleNappy}
            statusLabel={nappyStatus}
            onStatus={toggleNappyStatus}
            icon={require("../../../assets/nappy_icon.png")}
            iconSize={isWide ? 56 : 44}
          />

          {/* Food */}
          <Card
            title="Food Timer"
            timeText={formatHMS(foodRemainingMs)}
            subText={foodSub}
            primaryLabel={foodRunning ? "Reset" : "Start"}
            onPrimary={onToggleFood}
            statusLabel={foodStatus}
            onStatus={toggleFoodStatus}
            icon={require("../../../assets/food_icon.png")}
            iconSize={isWide ? 56 : 44}
          />

          {/* Summary – totals only */}
          <View
            style={{
              backgroundColor: "#ececec",
              borderRadius: 24,
              padding: 25,
              width: isWide ? 360 : "100%",
              height: isWide ? undefined : CARD_HEIGHT,
              justifyContent: "space-between",
              alignSelf: "stretch",
            }}
          >
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 10 }}>
                Summary
              </Text>
              <Text style={{ marginBottom: 6 }}>
                {`Nappy Timer: ${formatTotalHM(nappyTotalMs)}`}
              </Text>
              <Text style={{ marginBottom: 14 }}>
                {`Food Timer: ${formatTotalHM(foodTotalMs)}`}
              </Text>

              <Pressable
                onPress={openEdit}
                style={{
                  backgroundColor: "#0f172a",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Edit</Text>
              </Pressable>
            </View>

            <View>
              <Text style={{ color: "#4b5563", marginBottom: 10 }}>
                Ask Bibi to learn more about nap and food times for your children
              </Text>
              <Pressable
                onPress={() => navigation?.navigate?.("Bibi")}
                style={{
                  backgroundColor: "#4f46e5",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Ask Bibi</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit totals modal */}
      <Modal visible={editOpen} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 18,
              width: 460,
              maxWidth: "100%",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 12 }}>
              Set Timer Durations
            </Text>

            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Nappy (hh:mm)</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <TextInput
                value={nH}
                onChangeText={setNH}
                keyboardType="numeric"
                style={inputStyle}
                placeholder="hh"
              />
              <TextInput
                value={nM}
                onChangeText={setNM}
                keyboardType="numeric"
                style={inputStyle}
                placeholder="mm"
              />
            </View>

            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Food (hh:mm)</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <TextInput
                value={fH}
                onChangeText={setFH}
                keyboardType="numeric"
                style={inputStyle}
                placeholder="hh"
              />
              <TextInput
                value={fM}
                onChangeText={setFM}
                keyboardType="numeric"
                style={inputStyle}
                placeholder="mm"
              />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              <Pressable
                onPress={() => setEditOpen(false)}
                style={btnLight}
              >
                <Text style={{ fontWeight: "700" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={applyEdit}
                style={btnDark}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* modal input/button styles */
const inputStyle = {
  borderWidth: 1,
  borderColor: "#d1d5db",
  borderRadius: 10,
  paddingHorizontal: 12,
  height: 44,
  flex: 1,
  backgroundColor: "#fff",
} as const;

const btnLight = {
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 10,
  backgroundColor: "#e5e7eb",
  alignItems: "center",
} as const;

const btnDark = {
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 10,
  backgroundColor: "#111827",
  alignItems: "center",
} as const;
