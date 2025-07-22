import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import {View} from './components';
import MatrixBackground from './MatrixBackground';
import {useGameStore} from './store/store';
import {useTheme} from './contexts/ThemeContext';

interface MatrixProps {
  children: React.ReactNode;
}

export default function Matrix(props: MatrixProps) {
  const matrixWidth = useGameStore(state => state.matrixWidth);
  const matrixHeight = useGameStore(state => state.matrixHeight);
  const shadowPosition = useGameStore(state => state.shadowPosition);
  const shadowOpacity = useGameStore(state => state.shadowOpacity);
  const shadowSize = useGameStore(state => state.shadowSize);
  const {animatedBackgroundColor} = useTheme();

  return (
    <View center overflow="hidden">
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
