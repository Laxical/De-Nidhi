import {PrivyElements, PrivyProvider} from '@privy-io/expo';
import {Stack} from 'expo-router';
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from '@env';
import {Inter_400Regular, Inter_500Medium, Inter_600SemiBold} from '@expo-google-fonts/inter';
import {useFonts} from 'expo-font';
import Constants from "expo-constants";
import { SafeAreaView, View } from "react-native";
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
      config={{
        embedded: { 
          ethereum: { 
            createOnLogin: 'users-without-wallets',
          }, 
        }, 
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="profile" />
      </Stack>
      <PrivyElements />
    </PrivyProvider>
  );

  // Both of these work but no navigate animation when i use Slot
  // return (
  //   <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
  //     <SafeAreaView className="flex-1 bg-gray-100">
  //       <View style={{ height: Constants.statusBarHeight }} className="bg-gray-100" />
  //       <Slot />
  //     </SafeAreaView>
  //     <PrivyElements />
  //   </PrivyProvider>
  // );
}