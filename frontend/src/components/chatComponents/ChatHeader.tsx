import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useNavigation } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const chatHeader = ({ selectedFriend }) => {
    const navigation = useNavigation()

    return (
        <View className="mb-4">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
            <Text className="text-2xl font-bold text-blue-600">{selectedFriend}</Text>
        </View>
    )
}

export default chatHeader