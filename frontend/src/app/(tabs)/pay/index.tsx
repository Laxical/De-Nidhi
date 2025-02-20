"use client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEmbeddedEthereumWallet } from '@privy-io/expo';
import { ethers } from "ethers";
export default function Pay() {
  const { address } = useLocalSearchParams(); // Get the address from the QR code params
  const { wallets } = useEmbeddedEthereumWallet();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(address || ""); // Store the recipient address
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handlePayment = async () => {
    console.log(`Recipient address from QR: ${recipient}`);
    // Add further logic for handling payment
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="p-6 flex-1 justify-center">
          <Text className="text-3xl font-bold text-blue-600 mb-8">Payment</Text>
          
          <View className="bg-white p-6 rounded-xl shadow-sm mb-8">
        
            <Text className="font-medium mb-2">Amount (ETH)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-6"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.01"
              keyboardType="decimal-pad"
            />
            
            <Pressable
              className={`py-4 rounded-lg flex-row justify-center items-center ${isSuccess ? 'bg-green-500' : 'bg-blue-500'}`}
              onPress={handlePayment}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : isSuccess ? (
                <Text className="text-white font-medium">Payment Successful!</Text>
              ) : (
                <Text className="text-white font-medium">Send Payment</Text>
              )}
            </Pressable>
          </View>
          
          <Pressable
            className="py-3 px-6 self-center"
            onPress={() => router.back()}
          >
            <Text className="text-blue-500">Back to Profile</Text>
          </Pressable>
        </View> 
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
