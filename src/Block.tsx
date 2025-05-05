import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, PanResponder, StyleSheet} from 'react-native';
import {View} from './components';
import {useGameContext} from './contexts/GameContext';
import {useSizes} from './contexts/SizesContext';
import {useTheme} from './contexts/ThemeContext';
import {darkenColor} from './helpers';

import type {Block, BlockColumns} from './types';

interface BlockProps {
  block: Block;
  rightLimit?: number;
  leftLimit?: number;
}

function roundToNearestMultiple(num: number, multiple: number) {
  return Math.round(num / multiple) * multiple;
}

export default function Block(props: BlockProps) {
  const {blockPixelSize, martixColumns} = useSizes();
  const {theme} = useTheme();
  const {setShadowState, moveBlock} = useGameContext();

  const width = props.block.columns * blockPixelSize;
  const min = (props.leftLimit || 0) * blockPixelSize;
  const max = (props.rightLimit || martixColumns) * blockPixelSize - width;
  const initialX = props.block.initialX;
  const initialY = props.block.initialY;

  const pan = useRef(new Animated.ValueXY({x: initialX, y: initialY})).current;
  const [latestPosition, setLatestPosition] = useState(initialX);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    Animated.timing(pan.y, {
      toValue: initialY,
      duration: 75,
      useNativeDriver: true,
    }).start();
  }, [initialY, pan]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => {
          return true;
        },
        onPanResponderMove: (_e, gestureState) => {
          function setPanValue(value: number) {
            pan.setValue({x: value, y: initialY});
            setShadowState(() => ({
              shadowPosition: roundToNearestMultiple(value, blockPixelSize),
            }));
          }

          setShadowState(oldShadowState => {
            if (oldShadowState.showShadow) {
              return;
            }
            return {
              shadowColumns: props.block.columns,
              shadowPosition: initialX,
              showShadow: true,
            };
          });
          setIsMoving(true);

          if (gestureState.dx + latestPosition <= min) {
            setPanValue(min);
            return;
          }
          if (gestureState.dx + latestPosition >= max) {
            setPanValue(max);
            return;
          }
          setPanValue(gestureState.dx + latestPosition);
        },
        onPanResponderRelease: (_e, gestureState) => {
          setLatestPosition(oldValue => {
            let newLatestPosition = roundToNearestMultiple(
              gestureState.dx + oldValue,
              blockPixelSize,
            );
            if (gestureState.dx + latestPosition <= min) {
              newLatestPosition = min;
            }
            if (gestureState.dx + latestPosition >= max) {
              newLatestPosition = max;
            }
            pan.setValue({x: newLatestPosition, y: initialY});
            const newColumnIndex = newLatestPosition / blockPixelSize;
            if (newColumnIndex !== props.block.columnIndex) {
              moveBlock(props.block.id, newColumnIndex as BlockColumns);
            }
            return newLatestPosition;
          });
          pan.flattenOffset();
          setShadowState(() => ({showShadow: false}));
          setIsMoving(false);
        },
      }),
    [
      pan,
      min,
      max,
      latestPosition,
      blockPixelSize,
      props.block.id,
      props.block.columns,
      props.block.columnIndex,
      moveBlock,
      setShadowState,
      initialX,
      initialY,
    ],
  );

  const color = theme.blockColorOptions[props.block.colorIndex];

  return (
    <>
      <Animated.View
        style={[
          {
            transform: [{translateX: pan.x}, {translateY: pan.y}],
          },
          styles.blockContainer,
          isMoving && styles.movingBlock,
        ]}
        {...panResponder.panHandlers}>
        <View
          width={width}
          height={blockPixelSize}
          borderWidth={6}
          borderColor={darkenColor(color, 0.2)}
          bgColor={color}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  blockContainer: {
    position: 'absolute',
  },
  movingBlock: {
    zIndex: 1,
  },
});
