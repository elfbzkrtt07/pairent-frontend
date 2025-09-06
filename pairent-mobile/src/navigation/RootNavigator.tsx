// src/navigation/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import ConfirmSignUp from "../screens/Auth/ConfirmSignUp";
import Home from "../screens/Home/Home";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show splash while restoring session
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        // App stack (signed in)
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          {/* Add more protected screens here */}
        </Stack.Navigator>
      ) : (
        // Auth stack (signed out)
        <Stack.Navigator screenOptions={{ headerTitle: "" }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen
            name="ConfirmSignUp"
            component={ConfirmSignUp}
            options={{ headerTitle: "Confirm account" }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
