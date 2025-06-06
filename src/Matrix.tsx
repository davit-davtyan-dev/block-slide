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
  const {animatedBackgroundColor} = useTheme();

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
    bottom: 0,
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
});
