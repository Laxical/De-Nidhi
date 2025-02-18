import React, { useState } from "react";
import { View, Text, TextInput, Pressable, SafeAreaView, Alert } from "react-native";
import { ethers } from "ethers";
import { ETHRegister, provider } from "../../../config/etherconfig";
import {EIP1193Provider, usePrivy } from "@privy-io/expo"
import { Picker } from '@react-native-picker/picker';
import { useEmbeddedEthereumWallet } from "@privy-io/expo";
import { sign } from "viem/_types/accounts/utils/sign";

export default function RegisterENS() {
  const [ensName, setEnsName] = useState("");
  const [period,setPeriod]=useState(31536000);
  const [price,setPrice]=useState(0)
  const registrarController = new ethers.Contract(ETHRegister.address, ETHRegister.abi, provider);
  const { user, logout } = usePrivy();
  const resolver_address="0x8FADE66B79cC9f707aB26799354482EB93a5B7dD"
  const {isReady} = usePrivy();
  const {wallets} = useEmbeddedEthereumWallet();
  if (wallets.length === 0) {
    // The user has no embedded ethereum wallets
    return null;
  }
  const wallet = wallets[0];
  const wallet_address=wallet.address;
  const signMessage=async()=>{
    const privyProvider:EIP1193Provider=await wallet.getProvider();
    console.log(privyProvider);


  }
  signMessage();

  // Function to handle form submission
  const handleCommit = async () => {
    if (ensName.trim() === "") {
      Alert.alert("Error", "ENS name cannot be empty");
    } else {
      try {
        const isAvailable = await registrarController.available(ensName);
        console.log(isAvailable);

        if(!isAvailable){
          Alert.alert(`The name ${ensName} is already taken`);
          setEnsName("");
        }
        console.log("walletADDRESS",wallet_address);
        const randomByte32 = ethers.hexlify(ethers.randomBytes(32));
        const result = await registrarController.makeCommitment(
          ensName, 
          wallet_address,
          period,
          randomByte32,
          resolver_address,
          [], 
          false, 
          0
        );
        const commitmentHex = ethers.hexlify(result);
        console.log("Commitment Hash:", commitmentHex);
              // Send the commit transaction
      const commitTx = await registrarController.commit(commitmentHex);
      console.log("Timer start");
            // Wait for the transaction to be mined with 1 confirmation (default)
      const commitReceipt = await provider.waitForTransaction(commitTx.hash, 1, 60000); // 60 seconds timeout
      if (commitReceipt === null) {
        Alert.alert("Error", "Commitment transaction not mined in time.");
        return;
      }
      console.log("Timer stop");
      const price = await registrarController.rentPrice(ensName, period);
      const formattedPrice = ethers.formatUnits(price, 18);
      setPrice(Number(formattedPrice));
  
      } catch (error) {
        console.error("Error checking availability:", error);
        Alert.alert("Error", "Something went wrong while checking availability.");
      }
    }
  };
  const handleRegister=async()=>{
    const registerTx=await registrarController.register(
      ensName,
      wallet_address,
      period,
      0x0000000000000000000000000000000000000000000000000000000000000000,
      resolver_address,
      [],
      false,
      0
    )
    const commitReceipt = await provider.waitForTransaction(registerTx.hash, 1, 60000); // 60 seconds timeout
    console.log(commitReceipt);
    const ENSname = await provider.lookupAddress(wallet_address);
    console.log(ENSname);
  }
  if (!isReady) return (
    <View>
      <Text>
          Loggin First
      </Text>
    </View>);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="text-4xl font-bold text-blue-600 mb-4">Register ENS</Text>

        {/* TextInput to get the ENS name */}
        <TextInput
          className="border border-gray-300 p-3 rounded-lg mb-4"
          placeholder="Enter ENS Name"
          value={ensName}
          onChangeText={setEnsName}
        />

        {/* Picker for selecting the registration period */}
        <View className="border border-gray-300 rounded-lg mb-4">
          <Picker
            selectedValue={period}
            onValueChange={(itemValue) => setPeriod(itemValue)}
          >
            <Picker.Item label="1 Year" value={31536000} />
            <Picker.Item label="2 Years" value={63072000} />
          </Picker>
        </View>
         {/* Price Display */}
        {price && (
          <Text className="text-xl text-green-600 mb-4">
            Price: {price} ETH
          </Text>
        )}

        {/* Submit button */}
        <Pressable
          className="bg-blue-500 p-3 rounded-lg shadow-lg active:bg-blue-600"
          onPress={handleCommit}
        >
          <Text className="text-white text-center">Submit</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}
