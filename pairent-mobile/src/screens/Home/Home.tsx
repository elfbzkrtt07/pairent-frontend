import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Home({ navigation }: any) {
  const { user, signOut } = useAuth();

  const displayName = user?.name || user?.email || "Guest";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Home</Text>
      <Text style={{ fontSize: 18 }}>Welcome, {displayName}</Text>

      <Pressable
        onPress={handleSignOut}
        style={{
          backgroundColor: "crimson",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Sign out</Text>
      </Pressable>
    </View>
  );
}
