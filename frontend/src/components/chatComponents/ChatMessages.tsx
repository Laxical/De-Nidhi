import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { useEmbeddedEthereumWallet, useIdentityToken, usePrivy } from "@privy-io/expo"
import { useLocalSearchParams } from 'expo-router';
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { USDC_ADDRESS, BACKEND_URL } from '@env'
import { Alert } from 'react-native';

const USDC_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)"
];

const ChatMessages = ({ messages, setMessages, transactionHash, setTransactionHash }) => {
    const { wallets } = useEmbeddedEthereumWallet();
    const { getAccessToken } = usePrivy();
    const { getIdentityToken } = useIdentityToken();
    const { selectedFriend } = useLocalSearchParams();

    const handleSendUSDC = async (message) => {
        console.log(message);
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
            const amountInWei = parseUnits(message.amount, 6);

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
                body: JSON.stringify({ transactionHash: txHash })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Request successfully fulfilled");

                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === message._id ? { ...msg, status: true, transactionHash: txHash } : msg
                    )
                );
            } else {
                console.error("Failed to update request:", data.error);
            }
        } catch (error) {
            console.error("Error updating request:", error);
        }
    };

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
                body: JSON.stringify({ transactionHash: transactionHash })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Request successfully declined");

                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === message._id ? { ...msg, isDeclined: true } : msg
                    )
                );
            } else {
                console.error("Failed to decline request:", data.error);
            }
        } catch (error) {
            console.error("Error declining request:", error);
        }
    };

    return (
        <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <View
                    className={`p-3 my-2 rounded-lg max-w-[75%] ${
                        item.sender === wallets[0].address
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
                            {item.sender === wallets[0].address &&
                                (item.isDeclined ? (
                                    <Text className="text-white text-xs mt-2">
                                        Status: <Text className="text-red-500">Declined</Text>
                                    </Text>
                                ) : (
                                    <Text className="text-white text-xs mt-2">
                                        Status:{" "}
                                        <Text className={`${item.status ? "text-green-500" : "text-yellow-500"}`}>
                                            {item.status ? "Paid" : "Pending"}
                                        </Text>
                                    </Text>
                                ))}
                            <Text className="text-white text-xs">
                                {item.transactionHash ? `Tx: ${item.transactionHash}` : ""}
                            </Text>

                            {item.sender !== wallets[0].address && (
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
                                    {(item.status || item.isDeclined) && (
                                        <Text className="text-white text-xs mt-2">
                                            Status:{" "}
                                            <Text className={`${!item.isDeclined ? "text-green-500" : "text-red-500"}`}>
                                                {item.status ? "Paid" : "Declined"}
                                            </Text>
                                        </Text>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <Text className="text-white">{item.text}</Text>
                    )}
                </View>
            )}
            contentContainerStyle={{ flexGrow: 1 }}
        />
    );
};

export default ChatMessages