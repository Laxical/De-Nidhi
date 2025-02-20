import React, { useState } from "react";
import { View, Text, TextInput, Pressable, SafeAreaView, Alert } from "react-native";
import { ethers } from "ethers5";
import { ETHRegister } from "../../../config/etherconfig";
import { usePrivy } from "@privy-io/expo";
import { Picker } from '@react-native-picker/picker';
import { useEmbeddedEthereumWallet } from "@privy-io/expo";

export default function RegisterENS() {
  const [ensName, setEnsName] = useState("");
  const [period, setPeriod] = useState(31536000);
  const [price, setPrice] = useState(0);
  const [isCommitComplete, setIsCommitComplete] = useState(false); // New state variable
  const { user, logout } = usePrivy();
  const resolver_address = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";
  const [secret,setSecret]=useState("");
  const { isReady } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const wallet = wallets[0];
  const wallet_address = wallet.address;

  // Function to handle the commit step
  const handleCommit = async () => {
    if (ensName.trim() === "") {
      Alert.alert("Error", "ENS name cannot be empty");
    } else {
      try {
        const provider = await wallet.getProvider();
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const ethersSigner = ethersProvider.getSigner();

        const registrarController = new ethers.Contract(ETHRegister.address, ETHRegister.abi, ethersSigner);
        const isAvailable = await registrarController.available(ensName);
        if (!isAvailable) {
          Alert.alert(`The name ${ensName} is already taken`);
          setEnsName("");
          return;
        }
        console.log("avalaibility",isAvailable);

        const randomByte32 = ethers.utils.hexlify(ethers.utils.randomBytes(32));
        setSecret(randomByte32);

        const result = await registrarController.makeCommitment(
          ensName,
          wallet_address,
          period,
          randomByte32,
          resolver_address,
          [],
          true,
          0
        );

        const commitmentHex = ethers.utils.hexlify(result);
        const commitTx = await registrarController.commit(commitmentHex);
        console.log("commit hash",commitTx.hash);
        console.log("timer start");
        const commitReceipt = await ethersSigner.provider.waitForTransaction(commitTx.hash, 1, 60000);
        console.log("timer end");

        if (commitReceipt === null) {
          Alert.alert("Error", "Commitment transaction not mined in time.");
          return;
        }

        // Fetch the price
        const priceArray = await registrarController.rentPrice(ensName, period);
        const basePrice = priceArray[0];
        const additionalFee = priceArray[1] || 0; // Handle if additionalFee doesn't exist
        const formattedBasePrice = ethers.utils.formatUnits(basePrice, 18);
        const formattedAdditionalFee = ethers.utils.formatUnits(additionalFee, 18);
        const totalPrice = Number(formattedBasePrice) + Number(formattedAdditionalFee);

        setPrice(totalPrice);
        setIsCommitComplete(true); // Mark the commit as complete

      } catch (error) {
        console.error("Error checking availability or committing:", error);
        Alert.alert("Error", "Something went wrong while checking availability.");
      }
    }
  };

  // Function to handle the registration step
  const handleRegister = async () => {
    try {
      const provider = await wallet.getProvider();
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });

      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const ethersSigner = ethersProvider.getSigner();
      const registrarController = new ethers.Contract(ETHRegister.address, ETHRegister.abi, ethersSigner);
      const amount = (price * 1.05).toFixed(18); // Add 5% buffer
      console.log(amount);
      console.log(wallet_address);

      const registerTx = await registrarController.register(
        ensName,
        wallet_address,
        period,
        secret,
        resolver_address,
        [],
        true,
        0,
        {
          value:ethers.utils.parseEther(amount),
          gasLimit: 500000 // Explicit gas limit

        },
      );

      const registerReceipt = await ethersSigner.provider.waitForTransaction(registerTx.hash, 1, 60000);
      console.log(registerReceipt);

      const ENSname = await ethersSigner.provider.lookupAddress(wallet_address);
      console.log("Registered ENS Name:", ENSname);

    } catch (error) {
      console.error("Error in handleRegister:", error);
      Alert.alert("Error", "Something went wrong during registration.");
    }
  };

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
        {price > 0 && (
          <Text className="text-xl text-green-600 mb-4">
            Price: {price} ETH
          </Text>
        )}

        {/* Submit button changes to Confirm button once price is set */}
        <Pressable
          className="bg-blue-500 p-3 rounded-lg shadow-lg active:bg-blue-600"
          onPress={isCommitComplete ? handleRegister : handleCommit}
        >
          <Text className="text-white text-center">
            {isCommitComplete ? "Confirm" : "Submit"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
