import ChatInterface from "@/components/ChatInterface"
import PdfViewer from "@/components/PdfViewer"
import VideoCard from "@/components/VideoCard"
import { useLocalSearchParams } from "expo-router"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  PanResponder,
  Animated,
  useWindowDimensions,
} from "react-native"
import Draggable from 'react-native-draggable';

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

  // Calculate VideoCard size in dp
  const videoCardWidth = Math.round(width * 0.35); // 35% of screen width
  const videoCardHeight = Math.round(height * 0.25); // 25% of screen height

  // Restrict draggable area so VideoCard stays fully visible
  const maxX = width ;
  const maxY = height ;

  return (
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
        className="bg-gray-50 flex-col justify-between items-stretch flex-1"
        style={secondSectionStyle}
      >
        <ChatInterface />
      </AnimatedView>
      <Draggable
        x={50}
        y={50}
        minX={0}
        minY={0}
        maxX={maxX}
        maxY={maxY}
        onRelease={(e, wasDragging) => console.log('Released', wasDragging)}
        onDrag={(e, gestureState) => console.log('Dragging', gestureState.moveX, gestureState.moveY)}
        onPressOut={e => console.log('Press out')}
      >
        <VideoCard width={videoCardWidth} height={videoCardHeight} />
      </Draggable>
    </View>
  )
}
