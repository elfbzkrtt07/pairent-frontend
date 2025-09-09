import { View, Text, Pressable, ScrollView } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Profile({ navigation }: any) {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No user logged in.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#fafafa",
      }}
    >
      {/* Header */}
      <View
        style={{
          alignItems: "center",
          marginBottom: 20,
          backgroundColor: "white",
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: "#e5e5e5",
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#dbeafe",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: "800" }}>
            {user.name?.slice(0, 1).toUpperCase() ??
              user.email?.slice(0, 1).toUpperCase() ??
              "?"}
          </Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>
          {user.name ?? "Unnamed"}
        </Text>
        <Text style={{ color: "#6b7280" }}>{user.email}</Text>
      </View>

      {/* Details */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: "#e5e5e5",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
          Profile Information
        </Text>
        <Text style={{ marginBottom: 4 }}>Name: {user.name ?? "—"}</Text>
        <Text style={{ marginBottom: 4 }}>Email: {user.email}</Text>
        <Text>Birthdate: {user.birthdate ?? "—"}</Text>
      </View>

      {/* Sign out */}
      <Pressable
        onPress={async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
        style={{
          backgroundColor: "crimson",
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
