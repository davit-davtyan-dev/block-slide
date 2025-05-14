import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import {View} from './components';
import {useGameContext} from './contexts/GameContext';
import MatrixBackground from './MatrixBackground';
import {useSizes} from './contexts/SizesContext';
import {useTheme} from './contexts/ThemeContext';

interface MatrixProps {
  children: React.ReactNode;
}

export default function Matrix(props: MatrixProps) {
  const {matrixWidth, matrixHeight} = useSizes();
  const {shadowPosition, shadowOpacity, shadowSize} = useGameContext();
  const {themeAnimation} = useTheme();

  const animatedBackgroundColor = themeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#282a2c', '#282a2c'], // Since we don't have prev color, we'll use the same color
  });

  return (
    <View center>
      <Animated.View
        style={[
          {
            width: matrixWidth,
            height: matrixHeight,
            backgroundColor: animatedBackgroundColor,
          },
        ]}>
        <MatrixBackground />
        {props.children}
        <Animated.View
          style={[
            styles.shadow,
            {width: shadowSize, opacity: shadowOpacity},
            {
              transform: [{translateX: shadowPosition}],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'white',
  },
});
