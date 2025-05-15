import ChatInterface from "@/components/ChatInterface"
import { useLocalSearchParams } from "expo-router"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  PanResponder,
  Animated,
  useWindowDimensions,
} from "react-native"

export default function ReportDetail() {
  const { id } = useLocalSearchParams()
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  const minPercent = 0.2
  const maxPercent = 0.8
  const dividerSize = 24

  const [splitPercent] = useState(new Animated.Value(0.5))
  const [currentContainerSize, setCurrentContainerSize] = useState(
    isLandscape ? width : height
  )

  // Update container size on dimension/orientation change
  useEffect(() => {
    setCurrentContainerSize(isLandscape ? width : height)
  }, [width, height, isLandscape])

  // Dynamically calculate split sizes
  const splitSize = Animated.multiply(splitPercent, currentContainerSize - dividerSize)
  const secondSize = Animated.subtract(currentContainerSize - dividerSize, splitSize)

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
        Animated.spring(splitPercent, {
          toValue: splitPercent.__getValue(),
          useNativeDriver: false,
          friction: 7,
        }).start()
      },
    })
  ).current

  const AnimatedView = Animated.View
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
    <View className={`flex-1 ${containerStyle}`}>
      {/* First Section */}
      <AnimatedView
        className="bg-white justify-center items-center"
        style={firstSectionStyle}
      >
        <Text className="text-xl font-semibold">
          {isLandscape ? "Left Component" : "Top Component"}
        </Text>
        <Text className="text-gray-500">
          {Math.round(splitPercent.__getValue() * 100)}% of screen
        </Text>
      </AnimatedView>

      {/* Divider */}
      <View {...panResponder.panHandlers} className={dividerStyle}>
        <View className={handleStyle} />
      </View>

      {/* Second Section */}
      <AnimatedView
        className="bg-gray-50 flex-col justify-between items-stretch flex-1"
        style={secondSectionStyle}
      >
        <ChatInterface />

      </AnimatedView>
    </View>
  )
}
