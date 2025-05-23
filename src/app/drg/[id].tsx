import ChatInterface from "@/components/ChatInterface"
import PdfViewer from "@/components/PdfViewer"
import { useLocalSearchParams } from "expo-router"
import { useState, useRef, useEffect } from "react"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import {
  View,
  Text,
  PanResponder,
  Animated as RNAnimated,
  useWindowDimensions
} from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import VideoCard from "@/components/VideoCard";
import HeygenIntegration from "@/components/HeygenIntegration";

export default function ReportDetail() {
  const { id } = useLocalSearchParams()
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  // Split pane configuration
  const minPercent = 0.2
  const maxPercent = 0.8
  const dividerSize = 24
  const [splitPercent] = useState(new RNAnimated.Value(0.5))
  const [currentContainerSize, setCurrentContainerSize] = useState(
    isLandscape ? width : height
  )

  // Draggable card state
  const cardSize = useSharedValue({ width: 200, height: 150 });
  const cardPosition = useSharedValue({
    x: width / 2 - 100,
    y: height / 2 - 75
  });

  // Update container size on dimension/orientation change
  useEffect(() => {
    setCurrentContainerSize(isLandscape ? width : height)
  }, [width, height, isLandscape])

  // Dynamically calculate split sizes
  const splitSize = RNAnimated.multiply(splitPercent, currentContainerSize - dividerSize)
  const secondSize = RNAnimated.subtract(currentContainerSize - dividerSize, splitSize)

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const movePos = isLandscape ? gestureState.moveX : gestureState.moveY
        const newPercent = Math.max(
          minPercent,
          Math.min(maxPercent, movePos / currentContainerSize)
        )
        splitPercent.setValue(newPercent)
      },
      onPanResponderRelease: () => {
        RNAnimated.spring(splitPercent, {
          toValue: splitPercent.__getValue(),
          useNativeDriver: false,
          friction: 7,
        }).start()
      },
    })
  ).current

  // Gesture handlers for the draggable card
  const startPosition = useSharedValue({ x: cardPosition.value.x, y: cardPosition.value.y });
  const baseCardSize = useSharedValue({ width: cardSize.value.width, height: cardSize.value.height });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startPosition.value = { ...cardPosition.value };
    })
    .onUpdate((event) => {
      // Calculate new position with boundary constraints using translationX/Y
      const newX = Math.min(
        width - cardSize.value.width,
        Math.max(0, startPosition.value.x + event.translationX)
      );
      const newY = Math.min(
        height - cardSize.value.height,
        Math.max(0, startPosition.value.y + event.translationY)
      );

      cardPosition.value = {
        x: newX,
        y: newY
      };
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      baseCardSize.value = { ...cardSize.value };
    })
    .onUpdate((event) => {
      // Use baseCardSize to make pinch scaling relative and smooth
      const newWidth = Math.min(
        width * 0.8,
        Math.max(100, baseCardSize.value.width * event.scale)
      );
      const newHeight = Math.min(
        height * 0.8,
        Math.max(75, baseCardSize.value.height * event.scale)
      );
      cardSize.value = {
        width: newWidth,
        height: newHeight
      };
    });

  // Combine gestures
  const gesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated styles for the draggable card
  const animatedCardStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: cardPosition.value.x,
    top: cardPosition.value.y,
    width: cardSize.value.width,
    height: cardSize.value.height,
    minHeight: 125,
    minWidth: 125,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  }));

  const AnimatedView = RNAnimated.View
  const containerStyle = isLandscape ? "flex-row" : "flex-col"
  const dividerStyle = isLandscape
    ? "w-1 h-full bg-gray-200 justify-center items-center"
    : "h-1 w-full bg-gray-200 justify-center items-center"
  const handleStyle = isLandscape
    ? "h-4 w-1 bg-gray-500 rounded-full"
    : "w-4 h-1 bg-gray-500 rounded-full"

  const firstSectionStyle = isLandscape
    ? { width: splitSize }
    : { height: splitSize }
  const secondSectionStyle = isLandscape
    ? { width: secondSize }
    : { height: secondSize }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={`flex-1 ${containerStyle}`}>
        <AnimatedView
          className="bg-white justify-center items-center"
          style={firstSectionStyle}
        >
          <PdfViewer />
        </AnimatedView>

        <View {...panResponder.panHandlers} className={dividerStyle}>
          <View className={handleStyle} />
        </View>

        <AnimatedView
          className="bg-gray-50 flex-1"
          style={secondSectionStyle}
        >
          <ChatInterface />
        </AnimatedView>

        {/* The draggable card */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={animatedCardStyle}>
            <VideoCard/>
            {/* <HeygenIntegration/> */}
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  )
}
