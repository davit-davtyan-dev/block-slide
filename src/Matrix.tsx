import React, {useContext} from 'react';
import {View} from './components';
import {MainContext} from './MainContext';
import MatrixBackground from './MatrixBackground';
import useSizes from './hooks/useSizes';

interface MatrixProps {
  children: React.ReactNode;
}

export default function Matrix(props: MatrixProps) {
  const {matrixWidth, matrixHeight, blockPixelSize} = useSizes();
  const {setMatrixLayout, showShadow, shadowPosition, shadowColumns} =
    useContext(MainContext);

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
