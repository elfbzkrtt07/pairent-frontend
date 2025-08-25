import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Login({ navigation }: any) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setErr('');
    setBusy(true);
    try {
      await signIn(email.trim(), pwd);
    } catch (e: any) {
      setErr(e.message ?? 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding' })}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 20, gap: 12, justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '700', textAlign: 'center' }}>
          Welcome back
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            backgroundColor: 'white',
          }}
        />

        <TextInput
          value={pwd}
          onChangeText={setPwd}
          placeholder="Password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            backgroundColor: 'white',
          }}
        />

        {err ? <Text style={{ color: 'crimson' }}>{err}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={busy || !email || !pwd}
          style={{
            backgroundColor: busy || !email || !pwd ? '#94a3b8' : '#111827',
            padding: 14,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            No account? <Text style={{ fontWeight: '700' }}>Register</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
