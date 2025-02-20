"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, FlatList, SafeAreaView, TouchableOpacity } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useEmbeddedEthereumWallet, usePrivy } from "@privy-io/expo"
import { useLocalSearchParams } from "expo-router";
import { useSocket } from "../../config/socket"

export default function Chatscreen() {
  const socket = useSocket();
  const user = useEmbeddedEthereumWallet()
  const { selectedFriend } = useLocalSearchParams() 
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on("receiveMessage", (messageData) => {
      if (messageData.sender === selectedFriend) {
        setMessages((prevMessages) => [...prevMessages, messageData])
        console.log("here");
      }
    })

    return () => {
      socket.off("receiveMessage")
    }
  }, [selectedFriend])

  const sendMessage = () => {
    if (message.trim() && selectedFriend) {
      const newMessage = { text: message, sender: user.wallets[0].address }
      socket.emit("sendMessage", newMessage, selectedFriend)
      setMessages((prevMessages) => [...prevMessages, newMessage])
      setMessage("")
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <StatusBar style="dark" />

      <View className="mb-4">
        <Text className="text-2xl font-bold text-blue-600">{selectedFriend}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            className={`p-3 my-2 rounded-lg ${item.sender === user.wallets[0].address ? "bg-blue-100 self-end" : "bg-gray-200 self-start"}`}
          >
            <Text className="text-gray-900">
              {item.sender}: {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <View className="flex flex-row items-center space-x-2 mt-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-lg" onPress={sendMessage}>
          <Text className="text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

