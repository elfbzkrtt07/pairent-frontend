import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../../styles/colors";

const mockRooms = [
  { 
    id: "1", 
    name: "test_room_1", 
    url: "https://pairent.daily.co/test_room_1",
    description: "Casual parenting chat" 
  },
  { 
    id: "2", 
    name: "test_room_2", 
    url: "https://pairent.daily.co/test_room_2",
    description: "Newborn care tips" 
  },
  { 
    id: "3", 
    name: "test_room_3", 
    url: "https://pairent.daily.co/test_room_3",
    description: "Work-life balance" 
  },
  { 
    id: "4", 
    name: "test_room_4", 
    url: "https://pairent.daily.co/test_room_4",
    description: "Health & nutrition" 
  },
  { 
    id: "5", 
    name: "test_room_5", 
    url: "https://pairent.daily.co/test_room_5",
    description: "Toddlers & tantrums" 
  },
];

export default function Breakrooms() {
  const navigation = useNavigation();

  const joinRoom = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.base.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            color: colors.peach.text,
          }}
        >
          BREAKROOMS
        </Text>

        <Pressable
          onPress={() => navigation.navigate("CreateBreakroom" as never)}
          style={{
            marginLeft: "auto",
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.peach.dark,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.base.background,
              fontSize: 22,
              marginTop: -2,
              fontWeight: "800",
            }}
          >
            ＋
          </Text>
        </Pressable>
      </View>

      {/* Grid */}
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {mockRooms.map((item) => (
          <View
            key={item.id}
            style={{
              width: "22%", // 4 per row
              aspectRatio: 1.2,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.base.border,
              backgroundColor: colors.peach.light,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 2,
              padding: 12,
            }}
          >
            {/* Room name */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 8,
                textAlign: "center",
                color: colors.peach.text,
              }}
            >
              {item.name}
            </Text>

            {/* Room description */}
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: colors.peach.subtext,
                marginBottom: 12,
                textAlign: "center",
                fontWeight: "500",
              }}
              numberOfLines={2}
            >
              {item.description}
            </Text>

            {/* Join button */}
            <Pressable
              onPress={() => joinRoom(item.url)}
              style={{
                backgroundColor: colors.peach.dark,
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: 14,
                }}
              >
                JOIN
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
