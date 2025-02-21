import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';

const ChatInput = ({ message, setMessage, sendMessage, isOptionsOpen, setIsoptionsopen, setReqModal, setPayModal}) => {
    return (
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
    )
}

export default ChatInput