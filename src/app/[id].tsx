import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function ReportDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1">
      {/* Top Half */}
      <View className="flex-1 bg-white justify-center items-center border-b border-gray-200">
        <Text className="text-xl">hello</Text>
      </View>

      {/* Bottom Half */}
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-xl">worlds</Text>
      </View>
    </View>
  );
}
