import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {Text, TouchableOpacity} from './components';
import {useGameStore} from './store/store';
import {useTheme} from './contexts/ThemeContext';

export default function GameOverView() {
  const {theme, effectiveColorScheme} = useTheme();
  const gameOver = useGameStore(state => state.gameOver);
  const restart = useGameStore(state => state.restart);
  const bluryViewOpacity = useRef(new Animated.Value(0)).current;
  const [isBlurViewHidden, setIsBlurViewHidden] = useState(false);

  useEffect(() => {
    if (gameOver) {
      setIsBlurViewHidden(false);
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
      }).start(({finished}) => {
        if (!finished) {
          return;
        }
        setIsBlurViewHidden(true);
      });
    }
  }, [gameOver, bluryViewOpacity]);

  return (
    <Animated.View
      style={[
        styles.absolute,
        isBlurViewHidden && styles.displayNone,
        {opacity: bluryViewOpacity},
      ]}>
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
  displayNone: {
    display: 'none',
  },
});
