import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const initialMessages = [
    {
        text: "Hello! I'm Dr. G. How can I help you today?",
        sender: 'ai',
        timestamp: new Date(2024, 0, 1, 9, 0), // January 1, 2024, 9:00 AM
    },
    {
        text: "Hi Dr. G! I've been having headaches lately.",
        sender: 'user',
        timestamp: new Date(2024, 0, 1, 9, 2), // January 1, 2024, 9:02 AM
    },
    {
        text: "I'm sorry to hear that. How long have you been experiencing these headaches?",
        sender: 'ai',
        timestamp: new Date(2024, 0, 1, 9, 3),
    },
    {
        text: "For about a week now. They're particularly bad in the morning.",
        sender: 'user',
        timestamp: new Date(2024, 0, 2, 10, 15), // January 2, 2024, 10:15 AM
    },
    {
        text: "I understand. Let's try to identify the cause. Have you noticed any changes in your sleep pattern or stress levels recently?",
        sender: 'ai',
        timestamp: new Date(2024, 0, 2, 10, 17),
    },
    {
        text: "Yes, actually. I've been working late hours and getting less sleep than usual.",
        sender: 'user',
        timestamp: new Date(2024, 0, 2, 10, 20),
    },
    {
        text: "That could definitely be contributing to your headaches. I recommend trying to maintain a consistent sleep schedule and getting at least 7-8 hours of sleep per night. Also, try to take regular breaks during work to reduce eye strain. Would you like some specific relaxation techniques that might help?",
        sender: 'ai',
        timestamp: new Date(2024, 0, 3, 11, 30), // January 3, 2024, 11:30 AM
    },
];

const ChatInterface = () => {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isInferencing, setIsInferencing] = useState(false);
    const [hideVideoCard, setHideVideoCard] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateForSeparator = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };

    const isNewDay = (prevMessage, currentMessage) => {
        if (!prevMessage) return true;
        const prev = new Date(prevMessage.timestamp);
        const curr = new Date(currentMessage.timestamp);
        return prev.toDateString() !== curr.toDateString();
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const newMsg = {
                text: newMessage,
                sender: 'user',
                timestamp: new Date(),
            };
            setMessages([...messages, newMsg]);
            setNewMessage('');

            // Simulate AI response
            setIsInferencing(true);
            setTimeout(() => {
                const aiResponse = {
                    text: "I understand. Can you tell me more about your symptoms?",
                    sender: 'ai',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiResponse]);
                setIsInferencing(false);
            }, 2000);
        }
    };

    const MessageBubble = ({ message }) => (
        <View
            className={`flex-row mb-4 items-start ${message.sender === 'user' ? 'justify-end flex-row-reverse' : ''}`}
        >
            <View className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center mx-2">
                <Text className="text-base font-medium">
                    {message.sender === 'user' ? 'U' : 'G'}
                </Text>
            </View>
            <View
                className={`max-w-[80%] p-3 rounded-xl shadow ${message.sender === 'user' ? 'bg-indigo-600' : 'bg-white border border-gray-200'} `}
            >
                <Text className={`${message.sender === 'user' ? 'text-white' : 'text-black'} text-sm leading-5`}>
                    {message.text}
                </Text>
                <Text className={`text-xs opacity-70 text-right mt-1 ${message.sender === 'user' ? 'text-white' : 'text-gray-500'}`}>
                    {formatTimestamp(message.timestamp)}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header (optional, currently commented out) */}
            {/* <View style={styles.header}>
                <Text style={styles.title}>Chat with Dr.G</Text>
                <View style={styles.headerButtons}>
                    {hideVideoCard && (
                        <TouchableOpacity style={styles.iconButton}>
                            <Feather name="video" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.iconButton, styles.downloadButton]}
                        disabled={messages.length === 0}
                    >
                        <Feather
                            name="download"
                            size={20}
                            color="#fff" />
                    </TouchableOpacity>
                </View>
            </View> */}

            <ScrollView
                ref={scrollViewRef}
                className="flex-1 bg-gray-50 px-4 pt-4"
                onContentSizeChange={() =>
                    scrollViewRef.current?.scrollToEnd({ animated: true })
                }
            >
                {messages.map((message, index) => (
                    <View key={index}>
                        {(index === 0 || isNewDay(messages[index - 1], message)) && (
                            <View className="items-center my-2 border-t border-gray-200">
                                <Text className="text-xs text-gray-500 bg-gray-50 px-2 -mt-2">
                                    {formatDateForSeparator(message.timestamp)}
                                </Text>
                            </View>
                        )}
                        <MessageBubble message={message} />
                    </View>
                ))}
                {isInferencing && (
                    <View className="flex-row items-start mb-4">
                        <View className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center mx-2">
                            <Text className="text-base font-medium">G</Text>
                        </View>
                        <View className="max-w-[80%] p-3 rounded-xl shadow bg-white border border-gray-200">
                            <Text className="text-sm leading-5 text-black">...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View className="flex-row p-2 bg-gray-50 border-t border-gray-200 items-end">
                <TextInput
                    className="flex-1 bg-white rounded-lg px-3 py-2 mr-2 border border-gray-200 text-base"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#666"
                />
                <TouchableOpacity
                    className={`w-10 h-10 rounded-full bg-yellow-600 justify-center items-center ${!newMessage.trim() ? 'opacity-50' : ''}`}
                    onPress={handleSendMessage}
                    disabled={!newMessage.trim()}
                >
                    <Feather
                        name="send"
                        size={20}
                        color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};


export default ChatInterface;
