import { View, Text, Pressable } from "react-native";
import { useAuth } from "../context/AuthContext";
import colors from "../styles/colors";

type ActiveTab =
  | "home"
  | "forums"
  | "timers"
  | "milestones"
  | "breakrooms"
  | "BiBi"
  | "profile"
  | undefined;

export default function TopNav({
  navigation,
  activeTab,
}: {
  navigation: any;
  activeTab?: ActiveTab;
}) {
  const { user } = useAuth();
  const initial =
    user?.name?.slice(0, 1).toUpperCase() ??
    user?.email?.slice(0, 1).toUpperCase() ??
    "?";

  const Tab = ({
    label,
    screen,
    keyName,
  }: {
    label: string;
    screen: string;
    keyName: ActiveTab;
  }) => (
    <Pressable onPress={() => navigation.navigate(screen)} hitSlop={8}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: activeTab === keyName ? "700" : "400",
          color: activeTab === keyName ? colors.aqua.text : colors.aqua.dark,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        backgroundColor: "white",
      }}
    >
      {/* App logo/name -> Home */}
      <Pressable onPress={() => navigation.navigate("Home")} hitSlop={8}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>pairent</Text>
      </Pressable>

      {/* Center tabs */}
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "center",
          gap: 28,
        }}
      >
        <Tab label="home"       screen="Home"       keyName="home" />
        <Tab label="forums"     screen="Forums"     keyName="forums" />
        <Tab label="timers"     screen="Timers"     keyName="timers" />
        <Tab label="milestones" screen="Milestones" keyName="milestones" />
        <Tab label="breakrooms" screen="Breakroom"  keyName="breakrooms" />
        <Tab label="BiBi"       screen="BiBi"       keyName="BiBi" />
      </View>

      {/* Profile button */}
      <Pressable
        onPress={() => navigation.navigate("Profile")}
        hitSlop={8}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#dbeafe",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontWeight: "800" }}>{initial}</Text>
      </Pressable>
    </View>
  );
}
