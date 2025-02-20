"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, FlatList, SafeAreaView, TouchableOpacity } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { BACKEND_URL } from '@env'
import { useEmbeddedEthereumWallet, usePrivy, useIdentityToken } from "@privy-io/expo"

export default function Chats() {
  const [friends, setFriends] = useState([])
  const [friendAddress, setFriendAddress] = useState("")
  const router = useRouter()
  const { getIdentityToken } = useIdentityToken()
  const { getAccessToken } = usePrivy()

  const addFriend = async () => {
    if (friendAddress.trim() && !friends.includes(friendAddress)) {
      setFriends([...friends, friendAddress])
      setFriendAddress("")

      const identityToken = await getIdentityToken();
      const token = await getAccessToken();

      const response = await fetch(`${BACKEND_URL}/api/user/addFriend/${friendAddress}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "privy-id-token": identityToken
        }
      })

      const data = response.json();
    }
  }

  const navigateToChat = (selectedFriend) => {
    router.push(`/chatscreen?selectedFriend=${encodeURIComponent(selectedFriend)}`)
  }

  useEffect(() => {
    const fetchFriends = async () => {
      const identityToken = await getIdentityToken();
      const token = await getAccessToken();

      const response = await fetch(`${BACKEND_URL}/api/user/getFriends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "privy-id-token": identityToken
        }
      })

      const data = await response.json();
      setFriends(data.friends)
    }

    fetchFriends();
  },[])

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <StatusBar style="dark" />

      <View className="mb-4">
        <Text className="text-2xl font-bold text-blue-600">Chats</Text>
      </View>

      <View className="flex flex-row items-center space-x-2 mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter wallet address"
          value={friendAddress}
          onChangeText={setFriendAddress}
        />
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={addFriend}>
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-3 border-b border-gray-300 bg-white rounded-lg mb-2"
            onPress={() => navigateToChat(item)}
          >
            <Text className="text-gray-800 font-semibold">{item}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}