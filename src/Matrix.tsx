import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import {View} from './components';
import {useGameContext} from './contexts/GameContext';
import MatrixBackground from './MatrixBackground';
import {useSizes} from './contexts/SizesContext';

interface MatrixProps {
  children: React.ReactNode;
}

export default function Matrix(props: MatrixProps) {
  const {matrixWidth, matrixHeight} = useSizes();
  const {shadowPosition, shadowOpacity, shadowSize} = useGameContext();

  return (
    <View center>
      <View width={matrixWidth} height={matrixHeight} bgColor="#282a2c">
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
      </View>
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
