"use client"

import { useLogin, usePrivy } from "@privy-io/expo"
import { Link } from "expo-router"
import { useEffect, useState } from "react"
import { Pressable, Text, View, SafeAreaView, ScrollView, Linking } from "react-native"
import { StatusBar } from "expo-status-bar"
import { ETHERSCAN_API_KEY, USDC_ADDRESS, BACKEND_URL } from '@env';
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import provider from "@/config/etherconfig"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCameraPermissions } from 'expo-camera';
import { useRouter,router } from "expo-router"
import QRScannerButton from "./scanner/QRScannerButton"
export default function Page() {
  const [usdcBalance, setUsdcBalance] = useState(null);
  const { user, logout } = usePrivy()
  const { login } = useLogin()
  const [permission,requestPermission]=useCameraPermissions();
  const isPermissiongranted=Boolean(permission?.granted); 

  const handleAuthAction = async () => {
    if (user) {
      await logout()
    } else {
      try {
        const session = await login({ loginMethods: ["google", "email"] })
        console.log("User logged in", session.user)
      } catch (error) {
        console.log("Error logging in:", JSON.stringify(error, null, 2))
      }
    }
  }

  const handleBuyUSDC = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/circle/BUY`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        },
        body: JSON.stringify({userAddress: user.linked_accounts[1].address})
      });

      if (response.ok) {
        const data = await response.json();
        if(data.url.data.walletAddress.address === user.linked_accounts[1].address) {
          Linking.openURL(data.url.data.url);
        } else {
          console.error("Wallet address mismatch");
        }
      } else {
        console.error("Failed to create ramp session");
      }
    } catch (error) {
      console.error("Error creating ramp session:", error);
    }
  };
  
  const ENSname = async () => {
    console.log("Calling ENS lookup...");
    try {
      const wallet ="0x487a30c88900098b765d76285c205c7c47582512"
  //  const address = await provider.lookupAddress(wallet);

  
  //  const resolver=await provider.getResolver(address);
  //  console.log(resolver);
  const address=await provider.resolveName("sendou.eth")
      console.log("ENS Name result:", address);
    } catch(error) {
      console.log(error)
    }
  }
  const fetchUsdcBalance = async (address) => {
    try {
      const response = await fetch(`https://api-sepolia.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${USDC_ADDRESS}&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`);
      const data = await response.json();

      if (data.status === "1") {
        const balance = data.result;
        setUsdcBalance(balance / 1e6);
      } else {
        console.error("Error fetching balance:", data.message);
      }
    } catch (error) {
      console.error("Error fetching USDC balance:", error);
    }
  };``

  const handleSendUSDC = async () => {

  };

  useEffect(() => {
    if (user) {
      fetchUsdcBalance(user.linked_accounts[1].address);
    }
  },[user]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <View className="p-6">
          <Text className="text-4xl font-bold text-blue-600 mb-6">De-Nidhi</Text>

          {user && (
            <View className="items-center p-4 mb-6">
                 <Text className="text-lg font-medium mb-4">Scan To Pay</Text>
                 <QRScannerButton />
              <Text className="text-xs text-gray-500 mt-2 text-center">
                {user.linked_accounts[0].address.slice(0, 6)}...{user.linked_accounts[0].address.slice(-4)}
              </Text>
            </View>
          )}

          {/* User Profile Section */}
          {user ? (
            <View className="bg-white rounded-lg shadow-md p-4 mb-6">
              <Text className="text-lg font-semibold mb-2">Welcome, {user.linked_accounts[0].address || "User"}!</Text>
              <Text className="text-gray-600 mb-2">Balance: {usdcBalance} USDC</Text>
            </View>
          ) : (
            <View className="bg-white rounded-lg shadow-md p-4 mb-6">
              <Text className="text-lg text-center mb-4">Login to start sending and receiving crypto!</Text>
            </View>
          )}

          {/* Send USDC Button */}
          {user && (
            <Pressable
              onPress={handleSendUSDC}
              className="py-3 px-6 rounded-full bg-blue-500 mb-6 mx-10"
            >
              <Text className="text-white text-center font-semibold">Send USDC</Text>
            </Pressable>
          )}

          {/* Buy USDC Button */}
          {user && (
            <Pressable
              onPress={handleBuyUSDC}
              className="py-3 px-6 rounded-full bg-green-500 mb-6 mx-10"
            >
              <Text className="text-white text-center font-semibold flex justify-center items-center">
                <FontAwesome name="dollar" size={14} color="white" /> Buy USDC
              </Text>
            </Pressable>
          )}

          {/* Logout/Login Button */}
          <Pressable
            onPress={handleAuthAction}
            className={`py-3 px-6 rounded-full ${user ? "bg-red-500" : "bg-blue-500"}`}
          >
            <Text className="text-white text-center font-semibold">
              {user ? (
                <Text className="flex justify-center items-center">
                  <MaterialIcons name="logout" size={16} color="white" /> Logout
                </Text>
              ) : (
                "Login"
              )}
            </Text>
          </Pressable>

          {/* Recent Activity Section */}
          {user && (
            <View className="mt-8">
              <Text className="text-xl font-semibold mb-4">Recent Activity</Text>
              <View className="bg-white rounded-lg shadow-md p-4">
                <Text className="text-gray-500 text-center">No recent transactions</Text>
              </View>
            </View>
          )}

          {/* ENS Name Fetch Button */}
          <Pressable onPress={ENSname}>
            <Text>Get ENS Name</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

