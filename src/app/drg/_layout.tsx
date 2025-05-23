import { useEffect, useState } from "react";
import { Slot, useRouter, usePathname } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import { View, Text, Pressable, SafeAreaView, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from "@/store/auth";

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const isValidUser = useAuthStore(state => state.isValidUser);
  const initialize = useAuthStore(state => state.initialize);
  const [appReady, setAppReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname using the hook

  // Create overlay opacity animation value
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    const initApp = async () => {
      await initialize();
      setAppReady(true);
    };
    initApp();
  }, []);

  useEffect(() => {
    if (appReady && (!isLoggedIn || !isValidUser)) {
      router.replace('/');
    }
  }, [appReady, isLoggedIn, isValidUser]);

  // Update overlay opacity when sidebar opens/closes
  useEffect(() => {
    overlayOpacity.value = withTiming(isSidebarOpen ? 0.5 : 0, { duration: 300 });
  }, [isSidebarOpen]);

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(isSidebarOpen ? 0 : -300, {
          damping: 20,
          stiffness: 90,
        }),
      },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    display: overlayOpacity.value === 0 ? 'none' : 'flex',
  }));

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateTo = (route) => {
    router.push(route);
    closeSidebar();
  };
  const menuItems = [
    { name: 'Dashboard', icon: 'home' as const, route: '/drg' },
    { name: 'Profile', icon: 'user' as const, route: '/drg/profile' },
    { name: 'Settings', icon: 'settings' as const, route: '/drg/settings' },
    { name: 'Notifications', icon: 'bell' as const, route: '/drg/notifications' },
    { name: 'Help', icon: 'help-circle' as const, route: '/drg/help' },
  ];


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

  // Helper function to get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname.match(/\/[^/]+$/)) return "Chat With Dr.G";
    console.log("pathname", pathname);
    // Extract the last part of the path for other routes
    const pathParts = pathname.split('/');
    const lastSegment = pathParts[pathParts.length - 1];
    console.log(lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1));
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  if (!appReady) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-3xl font-bold">Dr.G</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      {isLoggedIn && (
        <>
          {/* Overlay to capture clicks outside sidebar */}
          <Animated.View
            className="absolute left-0 top-0 right-0 bottom-0 bg-black z-40"
            style={overlayStyle}
            pointerEvents={isSidebarOpen ? "auto" : "none"}
            onTouchStart={closeSidebar}
          />

          {/* Sidebar */}
          <Animated.View
            className="absolute left-0 top-0 bottom-0 w-[300px] bg-white z-50 shadow-lg"
            style={sidebarStyle}
          >
            <View className="p-6 bg-blue-600">
              <Text className="text-2xl font-bold text-white">Dr.G</Text>
            </View>

            <View className="mt-4">
              {menuItems.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  className="flex-row items-center p-4 hover:bg-gray-100 active:bg-gray-200"
                  onPress={() => navigateTo(item.route)}
                >
                  <Feather name={item.icon} size={20} color="#444" />
                  <Text className="text-gray-800 ml-3 font-medium">{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="absolute bottom-8 left-4 right-4 bg-red-500 py-3 rounded-lg flex-row justify-center items-center"
              onPress={() => {
                // Handle logout
                useAuthStore.getState().logout(); // Fixed logout call
                closeSidebar();
              }}
            >
              <Feather name="log-out" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Logout</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Header */}
          <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <View className="flex-row items-center">
              <Pressable
                className="p-2"
                onPress={toggleSidebar}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="menu" size={24} color="#333" />
              </Pressable>
              <Text className="text-lg font-semibold ml-2 ">
                {getPageTitle()}
              </Text>
            </View>
            {pathname === "/" && (
              <TouchableOpacity
                className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                onPress={handleUpload}
              >
                <Feather name="upload" size={18} color="white" />
                <Text className="text-white ml-2">Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
      <Slot />
    </SafeAreaView>
  );
}