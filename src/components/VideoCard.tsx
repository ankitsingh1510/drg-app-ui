import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

export default function VideoCard() {
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isInteractionOn, setIsInteractionOn] = useState(false);
    const [transcript, setTranscript] = useState("");

    // Handle speech recognition events
    useSpeechRecognitionEvent("result", (event) => {
        setTranscript(event.results[0]?.transcript || "");
    });

    useSpeechRecognitionEvent("start", () => {});
    useSpeechRecognitionEvent("end", () => {});
    useSpeechRecognitionEvent("error", (event) => {
        setTranscript("Error: " + event.message);
    });

    const toggleMic = async () => {
        if (isMicOn) {
            ExpoSpeechRecognitionModule.stop();
        } else {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (result.granted) {
                ExpoSpeechRecognitionModule.start({
                    lang: "en-US",
                    interimResults: true,
                    continuous: true,
                });
            } else {
                setTranscript("Permissions not granted");
            }
        }
        setIsMicOn((prev) => !prev);
    };

    const toggleCamera = () => {
        setIsCameraOn((prev) => !prev);
    };

    const startCall = () => {
        setIsInteractionOn(true);
        // Add your call starting logic here
    };

    const endCall = () => {
        setIsInteractionOn(false);
        // Add your call ending logic here
    };

    return (
        <View className="bg-black flex-1 p-2 justify-center items-center">
            {/* Main content area */}
            <View className="flex-1 w-full justify-center items-center">
                <Text className="text-white text-sm font-bold">
                    Connect with Dr.G
                </Text>
                {transcript ? (
                    <Text className="text-white text-sm mt-4 px-6 text-center">
                        {transcript}
                    </Text>
                ) : null}
            </View>

            {/* Bottom control bar */}
            <View className="w-full flex-row justify-center items-center space-x-12">
                {/* Camera toggle button */}
                <TouchableOpacity
                    onPress={toggleCamera}
                    className="bg-black bg-opacity-50 rounded-full p-3"
                    disabled={!isInteractionOn}
                >
                    <Ionicons
                        name={isCameraOn ? "videocam" : "videocam-off"}
                        size={16}
                        color={isCameraOn ? "white" : "gray"}
                    />
                </TouchableOpacity>
                {/* Call button */}
                {!isInteractionOn ? (
                    <TouchableOpacity
                        onPress={startCall}
                        className="rounded-full p-3 bg-green-500"
                    >
                        <Ionicons
                            name="call"
                            size={16}
                            color="white"
                        />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={endCall}
                        className="rounded-full p-3 bg-red-500"
                    >
                        <Ionicons
                            name="call"
                            size={16}
                            color="white"
                        />
                    </TouchableOpacity>
                )}
                {/* Mic toggle button */}
                <TouchableOpacity
                    onPress={toggleMic}
                    className="rounded-full p-3"
                    disabled={!isInteractionOn}
                >
                    <Ionicons
                        name={isMicOn ? "mic" : "mic-off"}
                        size={16}
                        color={isMicOn ? "white" : "gray"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
