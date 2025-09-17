import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import '@aws-amplify/react-native';

import { Buffer } from 'buffer';
import { TextEncoder, TextDecoder } from 'text-encoding';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}


import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
