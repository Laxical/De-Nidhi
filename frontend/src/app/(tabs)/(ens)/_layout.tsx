"use client"

import { View } from "react-native"
import { Stack } from "expo-router"

export default function ENSLayout() {
  return (
    <View className="flex-1">
 <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="register" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="transactions" />
        </Stack>    </View>
  )
}
