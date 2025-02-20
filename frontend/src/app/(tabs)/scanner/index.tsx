import { StyleSheet, Text, View, SafeAreaView, AppState } from "react-native";
import React, { useRef } from "react";
import { CameraView } from "expo-camera";
import { router, Stack, useFocusEffect, useRouter } from "expo-router";
import { Overlay } from "./Overlay";
import { useEffect } from "react";
export default function scanner() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: "Scan ner", headerShown: false }} />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          console.log(qrLock);
          if (data && !qrLock.current) {
            qrLock.current = true;
            setTimeout(async () => {
              router.push(`/pay?address=${data}`);
            }, 500);
          }
        }}
      />
      <Overlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
