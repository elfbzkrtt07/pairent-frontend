/**
 * RootNavigator
 *
 * Top-level navigator for the Pairent app.
 * - Shows a loading indicator while auth state is rehydrating.
 * - If a user exists -> Home stack; else -> Login/Register stack.
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import Home from '../screens/Home/Home';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerTitle: 'Pairent' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerTitle: '' }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
