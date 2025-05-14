import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import {Row, View} from './components';
import {useSizes} from './contexts/SizesContext';
import {useTheme} from './contexts/ThemeContext';

export default function MatrixBackground() {
  const {martixColumns, martixRows, blockPixelSize} = useSizes();
  const {animatedMatrixCellBackground, animatedMatrixCellBorder} = useTheme();

  return (
    <View position="absolute">
      {Array(martixRows)
        .fill(null)
        .map((_r, rIndex) => (
          <Row key={rIndex} position="absolute" top={blockPixelSize * rIndex}>
            {Array(martixColumns)
              .fill(null)
              .map((_c, cIndex) => (
                <Animated.View
                  key={cIndex}
                  style={[
                    {
                      ...styles.cell,
                      left: blockPixelSize * cIndex,
                      width: blockPixelSize,
                      height: blockPixelSize,
                      backgroundColor: animatedMatrixCellBackground,
                      borderColor: animatedMatrixCellBorder,
                    },
                  ]}
                />
              ))}
          </Row>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 1,
  },
});
