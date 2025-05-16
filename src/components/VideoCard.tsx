import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

export default function VideoCard({ width = 200, height = 120 }: { width?: number; height?: number }) {
    const [isMicOn, setIsMicOn] = useState(false);
    const [transcript, setTranscript] = useState("");

    // Handle speech recognition events
    useSpeechRecognitionEvent("result", (event) => {
        console.log("Speech recognition result:", event);
        setTranscript(event.results[0]?.transcript || "");
    });


    useSpeechRecognitionEvent("start", () => console.log("Speech recognition started"));
    useSpeechRecognitionEvent("end", () => console.log("Speech recognition ended"));
    useSpeechRecognitionEvent("error", (event) => {
        console.error("Speech recognition error:", event);
        setTranscript("Error: " + event.message);
    });


    const toggleMic = async () => {
        if (isMicOn) {
            // Stop speech recognition
            ExpoSpeechRecognitionModule.stop();
        } else {
            // Request permissions and start speech recognition
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

    return (
        <View className="bg-white rounded-lg shadow-md justify-center items-center" style={{ width, height }}>
            <Text className="text-base font-semibold text-gray-800">Video Card Content</Text>
            <Text className="text-sm text-gray-600 mt-2">Transcript: {transcript}</Text>
            <TouchableOpacity onPress={toggleMic} style={{ marginTop: 10 }}>
                <Ionicons
                    name={isMicOn ? "mic" : "mic-off"}
                    size={24}
                    color={isMicOn ? "green" : "red"}
                />
            </TouchableOpacity>
        </View>
    );
}
