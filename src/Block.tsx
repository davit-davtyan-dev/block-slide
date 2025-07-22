import React, {useMemo, useState} from 'react';
import {Animated, PanResponder, StyleSheet} from 'react-native';
import {View} from './components';
import {useGameStore} from './store/store';
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
  const blockPixelSize = useGameStore(state => state.blockPixelSize);
  const martixColumns = useGameStore(state => state.martixColumns);
  const {theme, themeAnimation} = useTheme();
  const setShadowState = useGameStore(state => state.setShadowState);
  const moveBlock = useGameStore(state => state.moveBlock);
  const hasQueuedTask = useGameStore(state => state.hasQueuedTask);
  const gameOver = useGameStore(state => state.gameOver);

  const width = props.block.columns * blockPixelSize;
  const min = (props.leftLimit || 0) * blockPixelSize;
  const max = (props.rightLimit || martixColumns) * blockPixelSize - width;
  const pan = props.block.pan;
  const scale = props.block.scale;
  const x = props.block.x;
  const y = props.block.y;

  const [latestPosition, setLatestPosition] = useState(x);
  const [isMoving, setIsMoving] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => {
          return !hasQueuedTask && !gameOver;
        },
        onPanResponderMove: (_e, gestureState) => {
          function setPanValue(value: number) {
            pan.setValue({x: value, y: y});
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
              shadowPosition: x,
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
            pan.setValue({x: newLatestPosition, y: y});
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
      x,
      y,
      hasQueuedTask,
      gameOver,
    ],
  );

  const color = theme.blockColorOptions[props.block.colorIndex];
  const borderColor = darkenColor(color, 0.2);
  const animatedColor = themeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [color, color], // Since we don't have prev color, we'll use the same color
  });

  const animatedBorderColor = themeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [borderColor, borderColor], // Since we don't have prev color, we'll use the same color
  });

  return (
    <>
      <Animated.View
        style={[
          {
            transform: [
              {translateX: pan.x},
              {translateY: pan.y},
              {scaleY: scale},
            ],
          },
          styles.blockContainer,
        ]}
        {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.block,
            {
              width,
              height: blockPixelSize,
              borderColor: animatedBorderColor,
              backgroundColor: animatedColor,
            },
          ]}
        />
      </Animated.View>
      <View
        style={[
          styles.block,
          styles.blockShadow,
          isMoving && styles.movingBlockShadow,
          {
            width,
            height: blockPixelSize,
            borderColor: borderColor,
            backgroundColor: color,
            transform: [{translateX: x}, {translateY: y}],
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  blockContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  block: {
    borderWidth: 6,
  },
  blockShadow: {
    position: 'absolute',
    opacity: 0,
  },
  movingBlockShadow: {
    opacity: 0.5,
  },
});
