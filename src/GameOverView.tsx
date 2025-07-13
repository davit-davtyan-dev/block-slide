import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {Text, TouchableOpacity} from './components';
import {useGameContext} from './contexts/GameContext';
import {useTheme} from './contexts/ThemeContext';

export default function GameOverView() {
  const {theme, effectiveColorScheme} = useTheme();
  const {gameOver, restart} = useGameContext();
  const bluryViewOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gameOver) {
      Animated.timing(bluryViewOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(bluryViewOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [gameOver, bluryViewOpacity]);

  return (
    <Animated.View style={[styles.absolute, {opacity: bluryViewOpacity}]}>
      <BlurView
        style={styles.absolute}
        blurType={effectiveColorScheme}
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <Text
        p={6}
        color={theme.mainColor}
        fontSize={64}
        fontWeight={700}
        numberOfLines={1}
        adjustsFontSizeToFit
        zIndex={20}>
        NO SPACE LEFT
      </Text>
      <TouchableOpacity
        mt={8}
        mx={14}
        py={2}
        px={8}
        onPress={restart}
        borderWidth={3}
        borderRadius={8}
        borderColor={theme.mainColor}
        zIndex={20}>
        <Text
          fontSize={64}
          color={theme.mainColor}
          fontWeight={500}
          numberOfLines={1}
          adjustsFontSizeToFit>
          NEW GAME
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
