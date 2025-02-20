"use client"

import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, Animated, Easing } from 'react-native';
import { Svg, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useCameraPermissions } from 'expo-camera';
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const QRScannerButton = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnimating, setIsAnimating] = useState(false);
  const scanLineAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  
  const isPermissionGranted = Boolean(permission?.granted);

  const startAnimation = () => {
    setIsAnimating(true);
    
    // Reset animations
    scanLineAnim.setValue(0);
    
    // Animate scan line
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    // Animate pulse effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Stop animation after 2 seconds and navigate
    setTimeout(() => {
      setIsAnimating(false);
      scanLineAnim.stopAnimation();
      pulseAnim.stopAnimation();
      
      if (isPermissionGranted) {
        router.push("/scanner");
      } else {
        requestCameraPermission();
      }
    }, 2000);
  };
  
  const requestCameraPermission = async () => {
    const { granted } = await requestPermission();
    if (granted) {
      router.push("/scanner");
    } else {
      console.error("Camera permission not granted");
    }
  };

  // Translate the scan line from top to bottom
  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120]
  });
  
  return (
    <View className="items-center mt-4">
      <Pressable 
        onPress={startAnimation}
        className={`items-center p-4 ${!isPermissionGranted ? "opacity-50" : ""}`}
      >
        <View className="items-center">
          <Animated.View 
            style={{
              transform: [{ scale: isAnimating ? pulseAnim : 1 }],
              position: 'relative',
              width: 150,
              height: 150,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* QR Code Frame */}
            <View className="w-36 h-36 border-2 border-blue-500 rounded-lg bg-black bg-opacity-5 overflow-hidden">
              {/* Corner markers */}
              <View className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-blue-500" />
              <View className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-blue-500" />
              <View className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-blue-500" />
              <View className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-blue-500" />
              
              {/* QR Code pattern (simplified) */}
              {!isAnimating && (
                <View className="flex-1 justify-center items-center">
                  <MaterialCommunityIcons name="qrcode-scan" size={60} color="#3b82f6" />
                </View>
              )}
              
              {/* Animated scan line */}
              {isAnimating && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    transform: [{ translateY: scanLineTranslateY }],
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                  }}
                />
              )}
            </View>
            
            {/* Glow effect when scanning */}
            {isAnimating && (
              <View className="absolute inset-0 -z-10 w-36 h-36 bg-blue-400 opacity-20 rounded-lg blur-xl" />
            )}
          </Animated.View>
          
          <Text className="text-lg font-medium mt-4 text-blue-600">
            {isAnimating ? "Opening Scanner..." : "Tap to Scan QR"}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default QRScannerButton;