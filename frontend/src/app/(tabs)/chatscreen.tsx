"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, FlatList, SafeAreaView, TouchableOpacity, Pressable, Modal, Alert } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useEmbeddedEthereumWallet, usePrivy, useIdentityToken } from "@privy-io/expo"
import { useLocalSearchParams } from "expo-router"
import { useSocket } from "../../config/socket"
import { BACKEND_URL, USDC_ADDRESS } from '@env'
import { useNavigation } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AntDesign from '@expo/vector-icons/AntDesign';
import { BrowserProvider, Contract, parseUnits } from "ethers";

const USDC_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)"
];

export default function Chatscreen() {
  const { wallets } = useEmbeddedEthereumWallet();
  const { getAccessToken } = usePrivy()
  const socket = useSocket();
  const user = useEmbeddedEthereumWallet()
  const { selectedFriend } = useLocalSearchParams() 
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const { getIdentityToken } = useIdentityToken()
  const navigation = useNavigation()
  const [usdcAmount, setUsdcAmount] = useState("")
  const [reqMessage, setReqMessage] = useState("")
  const [payMessage, setPayMessage] = useState("")
  const [isOptionsOpen, setIsoptionsopen] = useState(false)
  const [reqModal, setReqModal] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')

  useEffect(() => {
    fetchChat()
    socket.on("receiveMessage", (messageData) => {
      if (messageData.sender === selectedFriend) {
        setMessages((prevMessages) => [...prevMessages, messageData])
      }
    })

    return () => {
      socket.off("receiveMessage")
    }
  }, [selectedFriend])

  const fetchChat = async () => {
    if (!user) return;
    
    try {
      const identityToken = await getIdentityToken();
      const token = await getAccessToken();
      
      const response = await fetch(`${BACKEND_URL}/api/chat/getChats/${selectedFriend}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "privy-id-token": identityToken
        }
      });
  
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.chatHistory);
      } else {
        console.error("Failed to fetch chats:", data.error);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const sendMessage = () => {
    if (message.trim() && selectedFriend) {
      const newMessage = { text: message, amount: usdcAmount, isTransfer: false, sender: user.wallets[0].address, recipient: selectedFriend }
      socket.emit("sendMessage", newMessage)
      setMessages((prevMessages) => [...prevMessages, newMessage])
      setMessage("")
    }
  }

  const sendRequest = async () => {
    if (usdcAmount !== "" && selectedFriend) {
      const newMessage = { text: reqMessage, amount: usdcAmount, isRequest: true, sender: user.wallets[0].address, recipient: selectedFriend }
      socket.emit("sendMessage", newMessage)
      setMessages((prevMessages) => [...prevMessages, newMessage])
      setUsdcAmount("")
      setReqModal(false)
    }
  }

  const handleSendUSDC = async (message) => {
    const wallet = wallets[0];
    try {
        if (!wallet) {
            Alert.alert("Error", "Wallet not found. Please log in.");
            return;
        }

        const provider = await wallet.getProvider();
        
        await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
        });

        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();

        const usdcContract = new Contract(USDC_ADDRESS, USDC_ABI, signer);
        console.log("amount: ", usdcAmount);
        const amountInWei = parseUnits(message.amount, 6);
        console.log("amount: ", amountInWei);

        const tx = await usdcContract.transfer(selectedFriend, amountInWei);
        setTransactionHash(tx.hash);
        await tx.wait();

        Alert.alert("Success", `USDC Sent! TX Hash: ${tx.hash}`);
        console.log("Transaction Hash:", tx.hash);
        return tx.hash;
    } catch (error) {
        console.error("Transaction Error:", error);
        Alert.alert("Error", "Transaction failed. Check console for details.");
    }
  };

  const sendUSDC = async () => {
    if (usdcAmount !== "" && selectedFriend) {
      let newMessage = { text: payMessage, amount: usdcAmount, isTransfer: true, sender: user.wallets[0].address, recipient: selectedFriend, transactionHash, status: true }
      const txHash = await handleSendUSDC(newMessage)
      newMessage.transactionHash = txHash
      try {
        const identityToken = await getIdentityToken();
        const token = await getAccessToken();
        
        const response = await fetch(`${BACKEND_URL}/api/chat/directPay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "privy-id-token": identityToken
          },
          body: JSON.stringify(newMessage)
        });
    
        const data = await response.json();
        
        if (response.ok) {
          console.log("request sucessfully fulfilled");
        } else {
          console.error("Failed to fetch chats:", data.error);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
      setMessages((prevMessages) => [...prevMessages, newMessage])
      setUsdcAmount("")
      setPayModal(false)
    }
  }

  const handlePayRequest = async (message) => {
    const txHash = await handleSendUSDC(message);

    try {
      const identityToken = await getIdentityToken();
      const token = await getAccessToken();
      
      const response = await fetch(`${BACKEND_URL}/api/chat/request/${message._id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "privy-id-token": identityToken
        },
        body: JSON.stringify({transactionHash: txHash})
      });
  
      const data = await response.json();
      
      if (response.ok) {
        console.log("request sucessfully fulfilled");
      } else {
        console.error("Failed to fetch chats:", data.error);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }

  const handleDeclineRequest = async (message) => {
    try {
      const identityToken = await getIdentityToken();
      const token = await getAccessToken();
      
      const response = await fetch(`${BACKEND_URL}/api/chat/request/${message._id}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "privy-id-token": identityToken
        },
        body: JSON.stringify({transactionHash: transactionHash})
      });
  
      const data = await response.json();
      
      if (response.ok) {
        console.log("request sucessfully fulfilled");
      } else {
        console.error("Failed to fetch chats:", data.error);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <StatusBar style="dark" />

      <View className="mb-4">
        <Pressable onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-2xl font-bold text-blue-600">{selectedFriend}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            className={`p-3 my-2 rounded-lg max-w-[75%] ${
              item.sender === user.wallets[0].address
                ? "self-end bg-blue-500"
                : "self-start bg-gray-500"
            }`}
          >
            {item.isTransfer ? (
              <>
                <Text className="text-white font-bold">Sent USDC</Text>
                <Text className="text-white text-lg font-semibold">{item.amount} USDC</Text>
                <Text className="text-white text-xs">{item.transactionHash ? `Tx: ${item.transactionHash}` : ""}</Text>
              </>
            ) : item.isRequest ? (
              <>
                <Text className="text-white font-bold">Request for USDC</Text>
                <Text className="text-white text-lg font-semibold">{item.amount} USDC</Text>
                <Text className="text-white text-xs">{item.text}</Text>
                {
                  item.sender === user.wallets[0].address && (item.isDeclined ? (
                    <Text className="text-white text-xs mt-2">
                      Status: <Text className="text-red-500">Declined</Text>
                    </Text>
                  ) : (
                    <Text className="text-white text-xs mt-2">
                      Status: <Text className={`${item.status ? "text-green-500" : "text-yellow-500"}`}>
                        {item.status ? "Paid" : "Pending"}
                      </Text>
                    </Text>
                  ))
                }
                {
                  <Text className="text-white text-xs">{item.transactionHash ? `Tx: ${item.transactionHash}` : ""}</Text>
                }       
                {
                  item.sender !== user.wallets[0].address &&
                  <>
                    {!item.status && !item.isDeclined && (
                      <View className="flex-row mt-2">
                        <TouchableOpacity
                          className="bg-blue-500 px-3 py-1 rounded-lg"
                          onPress={() => handlePayRequest(item)}
                        >
                          <Text className="text-white font-semibold">Pay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-gray-400 px-3 py-1 rounded-lg ml-2"
                          onPress={() => handleDeclineRequest(item)}
                        >
                          <Text className="text-white font-semibold">Decline</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {
                      (item.status || item.isDeclined) &&
                      <Text className="text-white text-xs mt-2">Status: <Text className={`${!item.isDeclined ? "text-green-500" : "text-red-500"}`}>{item.status ? "Paid" : "Declined"}</Text></Text>
                    }     
                  </>
                }
              </>
            ) : (
              <Text className="text-white">{item.text}</Text>
            )}
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <View className="flex flex-row items-center space-x-2 mt-4">
        {
          !isOptionsOpen && <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg mr-2" onPress={() => setIsoptionsopen(true)}>
            <AntDesign name="right" size={16} color="white" />
          </TouchableOpacity>
        }
        {
          isOptionsOpen && 
          <>
            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg mr-2" onPress={() => setReqModal(true)}>
              <Text className="text-white font-semibold">request</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg mr-2" onPress={() => setPayModal(true)}>
              <Text className="text-white font-semibold">pay</Text>
            </TouchableOpacity>
          </>
        }

        <TextInput
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
        />
        {
          !isOptionsOpen && <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg ml-2" onPress={sendMessage}>
            <Text className="text-white font-semibold">Send</Text>
          </TouchableOpacity>
        }
        {
          isOptionsOpen && <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg ml-2" onPress={() => setIsoptionsopen(false)}>
            <AntDesign name="left" size={16} color="white" />
          </TouchableOpacity>
        }
      </View>

      <Modal visible={reqModal} animationType="fade" transparent>
        <View className="flex-1 justify-center items-center bg-white">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-lg font-bold mb-2">Request USDC</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={usdcAmount.toString()}
              onChangeText={(text) => setUsdcAmount(text)}
              placeholder="Enter USDC amount"
            />
            <View className="flex-row">
              <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={sendRequest}>
                <Text className="text-white font-semibold">Request</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-400 px-4 py-2 rounded-lg ml-2" onPress={() => setReqModal(false)}>
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={payModal} animationType="fade" transparent>
        <View className="flex-1 justify-center items-center bg-white">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-lg font-bold mb-2">Pay USDC</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={usdcAmount.toString()}
              onChangeText={(text) => setUsdcAmount(text)}
              placeholder="Enter USDC amount"
            />
            <View className="flex-row ">
              <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={sendUSDC}>
                <Text className="text-white font-semibold">Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-400 px-4 py-2 rounded-lg ml-2" onPress={() => setPayModal(false)}>
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}