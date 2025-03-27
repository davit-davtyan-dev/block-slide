import React from 'react';
import {View} from './components';
import {useGameContext} from './contexts/GameContext';
import MatrixBackground from './MatrixBackground';
import {useSizes} from './contexts/SizesContext';

interface MatrixProps {
  children: React.ReactNode;
}

export default function Matrix(props: MatrixProps) {
  const {matrixWidth, matrixHeight, blockPixelSize} = useSizes();
  const {setMatrixLayout, showShadow, shadowPosition, shadowColumns} =
    useGameContext();

  return (
    <View
      flex={1}
      center
      onLayout={event => {
        setMatrixLayout(event.nativeEvent.layout);
      }}>
      <View
        width={matrixWidth}
        height={matrixHeight}
        position="relative"
        bgColor="#282a2c">
        <MatrixBackground />
        {props.children}
        {showShadow && (
          <View
            style={{
              transform: [{translateX: shadowPosition}],
            }}
            position="absolute"
            width={shadowColumns * blockPixelSize}
            height="100%"
            bgColor="white"
            opacity={0.1}
          />
        )}
      </View>
    </View>
  );
}
