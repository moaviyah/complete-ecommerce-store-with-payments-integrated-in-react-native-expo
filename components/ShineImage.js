import React, { useRef, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const ShineImage = ({ source, style }) => {
  const shineAnimationRef = useRef(null);

  useEffect(() => {
    startShineAnimation();
  }, []);

  const startShineAnimation = () => {
    shineAnimationRef.current?.fadeIn(1200)?.then(() => {
      shineAnimationRef.current?.fadeOut(5000)?.then(() => {
        startShineAnimation();
      });
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={[styles.image, style]}
        resizeMode="contain"
      />
      <Animatable.View
        ref={shineAnimationRef}
        style={styles.shineOverlay}
        animation="fadeIn"
        duration={2000}
        iterationCount="infinite"
        useNativeDriver={true}
      >
        <LinearGradient
          colors={["white", "white"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    resizeMode: "cover",
  },
  shineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  gradient: {
    flex: 2,
  },
});

export default ShineImage;
