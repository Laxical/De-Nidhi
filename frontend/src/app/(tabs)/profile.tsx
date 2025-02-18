"use client"

import { usePrivy } from "@privy-io/expo"
import { Pressable, Text, View, SafeAreaView, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"

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
    </SafeAreaView>
  )
}