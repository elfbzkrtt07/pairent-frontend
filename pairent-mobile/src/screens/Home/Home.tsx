// src/screens/Home/Home.tsx
import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useAuth, getIdToken } from "../../context/AuthContext";

export default function Home({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [backendUser, setBackendUser] = useState<{ user_id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchBackendUser = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch("http://localhost:8081/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch backend user");
        const data = await res.json();
        setBackendUser(data);
      } catch (err) {
        console.error("Error fetching from backend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendUser();
  }, []);

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

      {loading ? (
        <ActivityIndicator size="small" />
      ) : backendUser ? (
        <View>
          <Text style={{ fontSize: 16 }}>Backend says:</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>ID: {backendUser.user_id}</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Email: {backendUser.email}</Text>
        </View>
      ) : (
        <Text style={{ color: "crimson" }}>Failed to fetch backend user info.</Text>
      )}

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
