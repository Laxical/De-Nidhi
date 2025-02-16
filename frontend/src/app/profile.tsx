"use client"

import { useLogin, usePrivy } from "@privy-io/expo"
import { Link } from "expo-router"
import { useEffect } from "react"
import { Pressable, Text, View, SafeAreaView, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

export default function Profile() {
  const { user } = usePrivy()

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <View className="p-6">
          <Text className="text-4xl font-bold text-blue-600 mb-6">Profile</Text>
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