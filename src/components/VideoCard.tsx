import React from "react";
import { View, Text } from "react-native";

export default function VideoCard({ width = 200, height = 120 }: { width?: number; height?: number }) {
    return (
        <View className="bg-white rounded-lg shadow-md justify-center items-center" style={{ width, height }}>
            <Text className="text-base font-semibold text-gray-800">Video Card Content how are you</Text>
        </View>
    );
}