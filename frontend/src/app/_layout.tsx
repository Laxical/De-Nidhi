import {PrivyElements, PrivyProvider} from '@privy-io/expo';
import {Stack} from 'expo-router';
import {Inter_400Regular, Inter_500Medium, Inter_600SemiBold} from '@expo-google-fonts/inter';
import {useFonts} from 'expo-font';
import Constants from "expo-constants";
import { SafeAreaView, View } from "react-native";
import "../global.css";
import { SocketProvider } from "../config/socket";
const PRIVY_APP_ID="cm77pogvd00b1tjdpbgq8otwp";
const PRIVY_CLIENT_ID="client-WY5gxxzsp6hFVYCt3DR8bUgCvr1J2BqN86WpRQdtxpAgr";

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
        <SocketProvider>
          <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name='+not-found'/>
          </Stack>
        </SocketProvider>
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