import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from "react-native"
import { Link } from "expo-router"
import Constants from "expo-constants"

function TabLayout() {
    return (
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
    );
}

export default function TabsLayout() {
  return(
    <SafeAreaProvider>
        <View style={{ height: Constants.statusBarHeight }} className="bg-gray-100" />
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="transactions" />
        </Stack>
        <TabLayout />
    </SafeAreaProvider>
  );
}
