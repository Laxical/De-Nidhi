import React, { createContext, useContext, useEffect } from "react"
import { io } from "socket.io-client"
import { BACKEND_URL } from "@env"
import { usePrivy } from "@privy-io/expo"

const SocketContext = createContext(null)

const socket = io(`${BACKEND_URL}`, {
  autoConnect: false,
  reconnection: true,
  transports: ["websocket"],
})

export const SocketProvider = ({ children }) => {
  const { user } = usePrivy()

  useEffect(() => {
    if(user) {
      if (!socket.connected) {
        socket.connect()
        console.log("Socket connected:", socket.id)
      }
      socket.emit("register", user.linked_accounts[1].address)
    }


    return () => {
      socket?.disconnect()
      console.log("Socket disconnected:", socket.id)
    }
  }, [user])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}


export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}