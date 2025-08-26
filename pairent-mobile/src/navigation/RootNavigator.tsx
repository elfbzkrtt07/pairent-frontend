// src/navigation/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import Home from "../screens/Home/Home";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  console.log("E: RootNavigator function body");

  return (
    <NavigationContainer onReady={() => console.log("F: Navigation ready")}>
      <Stack.Navigator screenOptions={{ headerTitle: "" }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
