import {PrivyElements, PrivyProvider} from '@privy-io/expo';
import {Slot} from 'expo-router';
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
    <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
      <SafeAreaView className="flex-1 bg-gray-100">
        <View style={{ height: Constants.statusBarHeight }} className="bg-gray-100" />
        <Slot />
      </SafeAreaView>
      <PrivyElements />
    </PrivyProvider>
  );
}