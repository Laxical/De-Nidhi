import {PrivyElements, PrivyProvider} from '@privy-io/expo';
import {Stack} from 'expo-router';
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from '@env';
import {Inter_400Regular, Inter_500Medium, Inter_600SemiBold} from '@expo-google-fonts/inter';
import {useFonts} from 'expo-font';
import "../global.css";

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
    >
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <PrivyElements />
    </PrivyProvider>
  );
}