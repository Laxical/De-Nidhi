"use client"

import { useLogin, usePrivy } from "@privy-io/expo"
import { Link } from "expo-router"
import { useEffect } from "react"
import { Pressable, Text, View, SafeAreaView, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import Constants from "expo-constants"

export default function Page() {
  const { user, logout } = usePrivy()
  const { login } = useLogin()

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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <View className="p-6">
          <Text className="text-4xl font-bold text-blue-600 mb-6">De-Nidhi</Text>

          {user ? (
            <View className="bg-white rounded-lg shadow-md p-4 mb-6">
              <Text className="text-lg font-semibold mb-2">Welcome, {user.name || "User"}!</Text>
              <Text className="text-gray-600 mb-2">Balance: 0.00 ETH</Text>
              <Link href="/send-money" asChild>
                <Pressable className="bg-blue-500 py-2 px-4 rounded-full">
                  <Text className="text-white text-center font-semibold">Send Money</Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <View className="bg-white rounded-lg shadow-md p-4 mb-6">
              <Text className="text-lg text-center mb-4">Login to start sending and receiving crypto!</Text>
            </View>
          )}

          <Pressable
            onPress={handleAuthAction}
            className={`py-3 px-6 rounded-full ${user ? "bg-red-500" : "bg-blue-500"}`}
          >
            <Text className="text-white text-center font-semibold">{user ? "Logout" : "Login"}</Text>
          </Pressable>

          {user && (
            <View className="mt-8">
              <Text className="text-xl font-semibold mb-4">Recent Activity</Text>
              <View className="bg-white rounded-lg shadow-md p-4">
                <Text className="text-gray-500 text-center">No recent transactions</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="flex-row justify-around py-4 bg-white border-t border-gray-200">
        <Link href="/" asChild>
          <Pressable className="items-center">
            <Ionicons name="home" size={24} color="black" />
            <Text className="text-xs mt-1">Home</Text>
          </Pressable>
        </Link>
        <Link href="/transactions" asChild>
          <Pressable className="items-center">
            <Ionicons name="list-outline" size={24} color="black" />
            <Text className="text-xs mt-1">Transactions</Text>
          </Pressable>
        </Link>
        <Link href="/profile" asChild>
          <Pressable className="items-center">
            <Ionicons name="person-outline" size={24} color="black" />
            <Text className="text-xs mt-1">Profile</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  )
}

