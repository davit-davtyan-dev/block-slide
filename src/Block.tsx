import React, {useMemo, useRef, useState} from 'react';
import {Animated, PanResponder, StyleSheet} from 'react-native';
import {View} from './components';
import {useGameContext} from './contexts/GameContext';
import useSizes from './hooks/useSizes';
import {useTheme} from './contexts/ThemeContext';
import {darkenColor} from './helpers';

import type {Block} from './types';

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
  const startPostion = props.block.startIndex * blockPixelSize;
  const min = (props.leftLimit || 0) * blockPixelSize;
  const max = (props.rightLimit || martixColumns) * blockPixelSize - width;

  const pan = useRef(new Animated.ValueXY({x: startPostion, y: 0})).current;
  const [latestPosition, setLatestPosition] = useState(startPostion);
  const [isMoving, setIsMoving] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => {
          return true;
        },
        onPanResponderStart: () => {
          console.log('START');
        },
        onPanResponderMove: (_e, gestureState) => {
          setShadowState({
            shadowColumns: props.block.columns,
            shadowPosition: startPostion,
            showShadow: true,
          });
          setIsMoving(true);

          if (gestureState.dx + latestPosition <= min) {
            pan.setValue({x: min, y: gestureState.dy});
            setShadowState({shadowPosition: min});
            return;
          }
          if (gestureState.dx + latestPosition >= max) {
            pan.setValue({x: max, y: gestureState.dy});
            setShadowState({shadowPosition: max});
            return;
          }
          pan.setValue({
            x: gestureState.dx + latestPosition,
            y: gestureState.dy,
          });

          setShadowState({
            shadowPosition: roundToNearestMultiple(
              gestureState.dx + latestPosition,
              blockPixelSize,
            ),
          });
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
            pan.setValue({x: newLatestPosition, y: gestureState.dy});
            const newStartIndex = newLatestPosition / blockPixelSize;
            if (newStartIndex !== props.block.startIndex) {
              moveBlock(props.block.id, newStartIndex);
            }
            return newLatestPosition;
          });
          pan.flattenOffset();
          setShadowState({showShadow: false});
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
      props.block.startIndex,
      moveBlock,
      setShadowState,
      startPostion,
    ],
  );

  const color = theme.blockColorOptions[props.block.colorIndex];

  return (
    <>
      <Animated.View
        style={[
          {
            transform: [{translateX: pan.x}],
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
