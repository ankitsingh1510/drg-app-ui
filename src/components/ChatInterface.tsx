import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';


const ChatInterface = () => {
    // Sample initial messages
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

    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isInferencing, setIsInferencing] = useState(false);
    const [hideVideoCard, setHideVideoCard] = useState(true);
    const scrollViewRef = useRef();

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
            style={[
                styles.messageBubble,
                message.sender === 'user'
                    ? styles.userMessageBubble
                    : styles.aiMessageBubble,
            ]}
        >
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                    {message.sender === 'user' ? 'U' : 'G'}
                </Text>
            </View>
            <View
                style={[
                    styles.messageContent,
                    message.sender === 'user'
                        ? styles.userMessageContent
                        : styles.aiMessageContent,
                ]}
            >
                <Text
                    style={[
                        styles.messageText,
                        message.sender === 'user' ? styles.userText : styles.aiText,
                    ]}
                >
                    {message.text}
                </Text>
                <Text style={[
                    styles.timestamp,
                    message.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp,
                ]}>
                    {formatTimestamp(message.timestamp)}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
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
                style={styles.messageContainer}
                onContentSizeChange={() =>
                    scrollViewRef.current.scrollToEnd({ animated: true })
                }
            >
                {messages.map((message, index) => (
                    <View key={index}>
                        {(index === 0 || isNewDay(messages[index - 1], message)) && (
                            <View style={styles.dateSeparator}>
                                <Text style={styles.dateSeparatorText}>
                                    {formatDateForSeparator(message.timestamp)}
                                </Text>
                            </View>
                        )}
                        <MessageBubble message={message} />
                    </View>
                ))}
                {isInferencing && (
                    <View style={styles.inferencing}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>G</Text>
                        </View>
                        <View style={[styles.messageContent, styles.aiMessageContent]}>
                            <Text style={styles.messageText}>...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#666"
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        !newMessage.trim() && styles.sendButtonDisabled,
                    ]}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        color: '#5c7ac6',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#daa520',
    },
    downloadButton: {
        backgroundColor: '#f9fafb',
    },
    messageContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 16,
    },
    messageBubble: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    userMessageBubble: {
        justifyContent: 'flex-end',
        flexDirection: 'row-reverse',
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '500',
    },
    messageContent: {
        maxWidth: '70%',
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    userMessageContent: {
        backgroundColor: '#5c7ac6',
    },
    aiMessageContent: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: '#000',
    },
    timestamp: {
        fontSize: 10,
        opacity: 0.7,
        textAlign: 'right',
        marginTop: 4,
    },
    userTimestamp: {
        color: '#fff',
    },
    aiTimestamp: {
        color: '#666',
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    dateSeparatorText: {
        fontSize: 12,
        color: '#666',
        backgroundColor: '#f9fafb',
        paddingHorizontal: 8,
        marginTop: -10,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#f9fafb',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#daa520',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    inferencing: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
});

export default ChatInterface;
