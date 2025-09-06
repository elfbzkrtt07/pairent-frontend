import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useAuth, getIdToken } from "../../context/AuthContext";

export default function Home({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = user?.name || user?.email || "Guest";

  useEffect(() => {
    let alive = true;
    async function loadToken() {
      try {
        const t = await getIdToken();
        if (alive) setToken(t);
      } catch (err) {
        console.error("Failed to load token:", err);
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadToken();
    return () => {
      alive = false;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Home</Text>
      <Text style={{ fontSize: 18 }}>Welcome, {displayName}</Text>

      {loading ? (
        <ActivityIndicator size="small" />
      ) : token ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Bearer Token:</Text>
          <Text style={{ fontSize: 12, color: "gray" }}>{token}</Text>
        </View>
      ) : (
        <Text style={{ color: "crimson" }}>No token found</Text>
      )}

      <Pressable
        onPress={handleSignOut}
        style={{
          marginTop: 20,
          backgroundColor: "crimson",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
