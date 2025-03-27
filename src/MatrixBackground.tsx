import React from 'react';
import {Row, View} from './components';
import {useSizes} from './contexts/SizesContext';

export default function MatrixBackground() {
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
