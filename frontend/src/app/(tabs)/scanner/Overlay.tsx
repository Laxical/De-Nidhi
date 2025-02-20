import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

const innerDimension = 300;

export const Overlay = () => {
  return (
    <View
      style={
        Platform.OS === "android" ? { flex: 1 } : StyleSheet.absoluteFillObject
      }
    >
      {/* Outer black semi-transparent overlay */}
      <View style={[styles.outerOverlay]} />

      {/* Inner rounded rectangle in the center */}
      <View style={styles.innerOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerOverlay: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "black",
    opacity: 0.5, // Semi-transparent background
  },
  innerOverlay: {
    position: "absolute",
    width: innerDimension,
    height: innerDimension,
    borderRadius: 50, // Rounded corners
    backgroundColor: "transparent", // Can adjust color if needed
    borderColor: "white", // Optional border
    borderWidth: 2, // Optional border thickness
    top: height / 2 - innerDimension / 2, // Center the inner view vertically
    left: width / 2 - innerDimension / 2, // Center the inner view horizontally
  },
});
