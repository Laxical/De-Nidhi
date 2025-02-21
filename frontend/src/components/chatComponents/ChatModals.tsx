import { View, Text, Modal, TextInput, TouchableOpacity, Alert } from 'react-native'
import { BrowserProvider, Contract, parseUnits } from "ethers"
import { BACKEND_URL, USDC_ADDRESS } from '@env'
import { useEmbeddedEthereumWallet, useIdentityToken, usePrivy } from "@privy-io/expo"
import { useLocalSearchParams } from 'expo-router'

const USDC_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)"
];

const ChatModals = ({ reqModal, setReqModal, payModal, setPayModal, usdcAmount, setUsdcAmount, reqMessage, setReqMessage, payMessage, setPayMessage, messages, setMessages, socket, transactionHash, setTransactionHash}) => {
    const { wallets } = useEmbeddedEthereumWallet();
    const { getAccessToken } = usePrivy();
    const { getIdentityToken } = useIdentityToken();
    const { selectedFriend } = useLocalSearchParams() 
    
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
    
    const sendRequest = async () => {
        if (usdcAmount !== "" && selectedFriend) {
            const newMessage = { text: reqMessage, amount: usdcAmount, isRequest: true, sender: wallets[0].address, recipient: selectedFriend }
            socket.emit("sendMessage", newMessage)
            setMessages((prevMessages) => [...prevMessages, newMessage])
            setUsdcAmount("")
            setReqModal(false)
        }
    }
    
    const sendUSDC = async () => {
        if (usdcAmount !== "" && selectedFriend) {
          let newMessage = { text: payMessage, amount: usdcAmount, isTransfer: true, sender: wallets[0].address, recipient: selectedFriend, transactionHash, status: true }
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

    return (
        <><Modal visible={reqModal} animationType="fade" transparent>
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
        </Modal></>
    )
    }

export default ChatModals