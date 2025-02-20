"use client";
import { usePrivy } from "@privy-io/expo";
import { Pressable, Text, View, SafeAreaView, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEmbeddedEthereumWallet } from '@privy-io/expo';
import { useRouter } from "expo-router";
import QRCode from 'react-native-qrcode-svg';

export default function Profile() {
  const { user } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const router = useRouter();
  
  if (wallets.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text>No embedded wallet found</Text>
      </SafeAreaView>
    );
  }
  
  const wallet = wallets[0];
  
  // Format based on environment - adjust as needed for your setup
  const internalLink = `${wallet.address}`;
  
  const handlePayPress = () => {
    router.push({
      pathname: "/pay",
      params: { address: wallet.address }
    });
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <View className="p-6">
          <Text className="text-4xl font-bold text-blue-600 mb-6">Profile</Text>
        </View>
        <View className="items-center p-4">
          <Text className="text-lg font-medium mb-4">Scan to Pay</Text>
          <QRCode
            value={internalLink}
            size={200}
            backgroundColor="white"
          />
          <Text className="text-xs text-gray-500 mt-2 text-center">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</Text>
          <Pressable 
            className="bg-blue-500 py-3 px-6 rounded-full mt-6"
            onPress={handlePayPress}
          >
            <Text className="text-white font-medium">Go to Payment Page</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}