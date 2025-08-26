import 'react-native-gesture-handler';
import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { Amplify } from 'aws-amplify';
import configureAuth  from 'aws-amplify/auth';
import awsConfig from './src/config/aws-exports';

console.log('K1: before config');
Amplify.configure(awsConfig);
console.log('K2: after config');

export default function App() {
  console.log('K3: App render');
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
