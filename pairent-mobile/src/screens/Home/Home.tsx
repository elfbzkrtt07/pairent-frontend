import { View, Text, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user, signOut } = useAuth();

  const displayName =
    user?.name && user.name.trim() !== '' ? user.name : user?.email;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Home</Text>
      <Text style={{ opacity: 0.7 }}>Welcome, {displayName}</Text>

      <Pressable
        onPress={signOut}
        style={{
          backgroundColor: '#dc9191ff',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>Sign out</Text>
      </Pressable>
    </View>
  );
}
