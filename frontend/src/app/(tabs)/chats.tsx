import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, SafeAreaView, TouchableOpacity } from "react-native";
import { io } from "socket.io-client";
import { StatusBar } from "expo-status-bar";
import { usePrivy } from "@privy-io/expo";
import { BACKEND_URL } from "@env";

const socket = io(`${BACKEND_URL}`);

export default function Chats() {
  const { user } = usePrivy();
  const [friends, setFriends] = useState([]); // List of friends (wallet addresses)
  const [friendAddress, setFriendAddress] = useState(""); // Address input for adding friend
  const [selectedFriend, setSelectedFriend] = useState(null); // Current chat friend
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user?.linked_accounts[1]?.address) {
      socket.emit("register", user.linked_accounts[1].address);
    }

    socket.on("receiveMessage", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [user]);

  useEffect(() => {
    console.log(selectedFriend);
  },[selectedFriend])

  // Function to add a friend by wallet address
  const addFriend = () => {
    if (friendAddress.trim() && !friends.includes(friendAddress)) {
      setFriends([...friends, friendAddress]);
      setFriendAddress("");
    }
  };

  // Function to send message to selected friend
  const sendMessage = () => {
    if (message.trim() && selectedFriend) {
      const newMessage = { text: message, sender: user.linked_accounts[1].address };
      socket.emit("sendMessage", newMessage, selectedFriend);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <StatusBar style="dark" />

      {/* HEADER */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-blue-600">Chats</Text>
      </View>

      {/* FRIENDS LIST & ADD FRIEND */}
      <View className="flex flex-row items-center space-x-2 mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter wallet address"
          value={friendAddress}
          onChangeText={setFriendAddress}
        />
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={addFriend}
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      {/* FRIENDS LIST */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`p-3 border-b border-gray-300 ${selectedFriend === item ? "bg-blue-200" : "bg-white"} rounded-lg`}
            onPress={() => setSelectedFriend(item)}
          >
            <Text className="text-gray-800 font-semibold">{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* CHAT MESSAGES */}
      {selectedFriend && (
        <>
          <Text className="text-lg font-bold text-gray-700 mt-4">Chat with: {selectedFriend}</Text>

          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View className={`p-3 my-2 rounded-lg ${item.sender === user.linked_accounts[1].address ? "bg-blue-100 self-end" : "bg-gray-200 self-start"}`}>
                <Text className="text-gray-900">{item.sender}: {item.text}</Text>
              </View>
            )}
            contentContainerStyle={{ flexGrow: 1 }}
          />

          {/* MESSAGE INPUT */}
          <View className="flex flex-row items-center space-x-2 mt-4">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
            />
            <TouchableOpacity 
              className="bg-green-500 px-4 py-2 rounded-lg"
              onPress={sendMessage}
            >
              <Text className="text-white font-semibold">Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
