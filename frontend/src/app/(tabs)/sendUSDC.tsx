import { useEmbeddedEthereumWallet, usePrivy, useIdentityToken } from "@privy-io/expo";
import { Pressable, Text, View, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { USDC_ADDRESS } from '@env'

export default function SendUSDC() {
  const { wallets } = useEmbeddedEthereumWallet();
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const USDC_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)"
  ];

  const handleSendUSDC = async () => {
    const wallet = wallets[0];
    try {
        if (!wallet) {
            Alert.alert("Error", "Wallet not found. Please log in.");
            return;
        }

        const provider = await wallet.getProvider();
        
        await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
        });

        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
;
        const usdcContract = new Contract(USDC_ADDRESS, USDC_ABI, signer); 
        const amountInWei = parseUnits(amount, 6);

        const tx = await usdcContract.transfer(recipientAddress, amountInWei);
        await tx.wait();

        Alert.alert("Success", `USDC Sent! TX Hash: ${tx.hash}`);
        console.log("Transaction Hash:", tx.hash);
    } catch (error) {
        console.error("Transaction Error:", error);
        Alert.alert("Error", "Transaction failed. Check console for details.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1 px-6 py-4">
        
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="black" />
          </Pressable>
          <Text className="text-3xl font-bold text-blue-600">Send USDC</Text>
        </View>

        <View className="bg-gray-100 p-6 rounded-2xl shadow-md">
          <Text className="text-lg font-semibold text-gray-700 mb-2">Recipient Address</Text>
          <TextInput
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 shadow-sm"
            value={recipientAddress}
            onChangeText={setRecipientAddress}
            placeholder="Enter recipient's wallet address"
            placeholderTextColor="#A0A0A0"
          />

          <Text className="text-lg font-semibold text-gray-700 mt-4 mb-2">Amount (USDC)</Text>
          <TextInput
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 shadow-sm"
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          className="bg-blue-500 mt-6 py-4 rounded-full shadow-lg flex items-center justify-center"
          onPress={handleSendUSDC}
        >
          <Text className="text-white text-lg font-bold">Send USDC</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
