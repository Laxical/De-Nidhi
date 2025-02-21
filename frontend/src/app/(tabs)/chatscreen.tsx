"use client"

import { useState, useEffect } from "react"
import { SafeAreaView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useEmbeddedEthereumWallet, usePrivy, useIdentityToken } from "@privy-io/expo"
import { useLocalSearchParams } from "expo-router"
import { useSocket } from "../../config/socket"
import { BACKEND_URL } from '@env'
import ChatHeader from "@/components/chatComponents/ChatHeader"
import ChatMessages from "@/components/chatComponents/ChatMessages"
import ChatInput from "@/components/chatComponents/ChatInput"
import ChatModals from "@/components/chatComponents/ChatModals"


export default function Chatscreen() {
  const { getAccessToken } = usePrivy()
  const socket = useSocket();
  const user = useEmbeddedEthereumWallet()
  const { selectedFriend } = useLocalSearchParams() 
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const { getIdentityToken } = useIdentityToken()
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <StatusBar style="dark" />

      <ChatHeader 
        selectedFriend={selectedFriend} 
      />

      <ChatMessages 
        messages={messages} 
        setMessages={setMessages}
        transactionHash={transactionHash} 
        setTransactionHash={setTransactionHash} 
      />

      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        isOptionsOpen={isOptionsOpen}
        setIsoptionsopen={setIsoptionsopen}
        setReqModal={setReqModal}
        setPayModal={setPayModal}
      />

      <ChatModals
        reqModal={reqModal}
        setReqModal={setReqModal}
        payModal={payModal}
        setPayModal={setPayModal}
        usdcAmount={usdcAmount}
        setUsdcAmount={setUsdcAmount}
        reqMessage={reqMessage}
        setReqMessage={setReqMessage}
        payMessage={payMessage}
        setPayMessage={setPayMessage}
        messages={messages}
        setMessages={setMessages}
        socket={socket}
        transactionHash={transactionHash}
        setTransactionHash={setTransactionHash}
      />
      
    </SafeAreaView>
  )
}