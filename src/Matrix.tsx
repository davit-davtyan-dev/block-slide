import React, {useContext} from 'react';
import {Row, View} from './components';
import {MainContext} from './MainContext';
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

function MatrixBackground() {
  const {martixColumns, martixRows, blockPixelSize} = useSizes();

  return (
    <View position="absolute">
      {Array(martixRows)
        .fill(null)
        .map((_r, rIndex) => (
          <Row key={rIndex} position="absolute" top={blockPixelSize * rIndex}>
            {Array(martixColumns)
              .fill(null)
              .map((_c, cIndex) => (
                <View
                  left={blockPixelSize * cIndex}
                  key={cIndex}
                  position="absolute"
                  size={`${blockPixelSize}px`}
                  bgColor="#1b1c1d"
                  borderRadius={4}
                  borderWidth={1}
                  borderColor="#282a2c"
                />
              ))}
          </Row>
        ))}
    </View>
  );
}
