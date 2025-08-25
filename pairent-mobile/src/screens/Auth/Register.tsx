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

export default function Register({ navigation }: any) {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setErr('');
    if (pwd !== confirm) {
      setErr('Passwords do not match');
      return;
    }
    if (!name.trim()) {
      setErr('Please enter your name');
      return;
    }
    setBusy(true);
    try {
      await signUp(email.trim(), pwd, name.trim());
    } catch (e: any) {
      setErr(e.message ?? 'Registration failed');
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
          Create account
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          autoCapitalize="words"
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            backgroundColor: 'white',
          }}
        />

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
          placeholder="Password (min 8)"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            backgroundColor: 'white',
          }}
        />

        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            backgroundColor: '#fff',
          }}
        />

        {err ? <Text style={{ color: 'crimson' }}>{err}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={busy || !name || !email || !pwd || !confirm}
          style={{
            backgroundColor:
              busy || !name || !email || !pwd || !confirm
                ? '#94a3b8'
                : '#111827',
            padding: 14,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            {busy ? 'Creating…' : 'Create account'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            Have an account? <Text style={{ fontWeight: '700' }}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
