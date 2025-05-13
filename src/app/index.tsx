import { Link } from "expo-router";
import React from "react";
import { Text, View, Pressable, ScrollView } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from "../store/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MOCK_REPORTS = [
  { id: 1, title: "Q1 Financial Report", date: "2025-03-31" },
  { id: 2, title: "Employee Satisfaction Survey", date: "2025-04-15" },
  { id: 3, title: "Market Analysis 2025", date: "2025-05-01" },
  { id: 4, title: "Operations Review", date: "2025-05-10" },
];

export default function Page() {

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });
      
      if (result.assets && result.assets[0]) {
        // Here you would typically handle the file upload
        console.log('Selected file:', result.assets[0].name);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold">Dashboard</Text>
        <View className="flex-row gap-4">
          <Pressable
            onPress={handleUpload}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Upload</Text>
          </Pressable>
          
        </View>
      </View>

      <View className="gap-4">
        {MOCK_REPORTS.map((report) => (
          <Link
            key={report.id}
            href={`/${report.id}`}
            asChild
          >
            <Pressable className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <Text className="text-lg font-semibold">{report.title}</Text>
              <Text className="text-gray-500 mt-1">Date: {report.date}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}