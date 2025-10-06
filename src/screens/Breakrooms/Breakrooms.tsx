import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import colors from "../../styles/colors";
import { listBreakrooms } from "../../services/breakrooms";

type Room = {
  id: string;
  name: string;
  url: string;
};

export default function Breakrooms() {
  const navigation = useNavigation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await listBreakrooms();
      setRooms(data);
    } catch (err) {
      console.error("Error loading rooms", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [])
  );

  const joinRoom = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: colors.base.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.peach.text }}>
          BREAKROOMS
        </Text>

        <Pressable
          onPress={() => navigation.navigate("CreateBreakroom" as never)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.peach.dark,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>＋</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.peach.dark} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: rooms.length < 6 ? "flex-start" : "space-between", 
            paddingHorizontal: 10,
          }}
        >
          {rooms.map((item) => (
            <View
              key={item.id}
              style={{
                width: "15%", // about 6 per row
                aspectRatio: 0.9,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.base.border,
                backgroundColor: colors.peach.light,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
                marginHorizontal: 5,
                paddingVertical: 8,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              {/* Room name */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  marginBottom: 8,
                  textAlign: "center",
                  color: colors.peach.text,
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              {/* JOIN button */}
              <Pressable
                onPress={() => joinRoom(item.url)}
                style={{
                  backgroundColor: colors.peach.dark,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  alignItems: "center",
                  width: "80%",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 10,
                  }}
                >
                  JOIN
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
