import {useCallback} from 'react';
import {Animated} from 'react-native';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {useSizes} from '../contexts/SizesContext';
import {BLOCK_COLOR_COUNT} from '../contexts/ThemeContext';
import {getRandomNumberInRangeInclusive} from '../helpers';

import type {Block, BlockColumns} from '../types';

export default function useGenerateRow() {
  const {blockPixelSize, martixRows} = useSizes();

  return useCallback(
    (rowIndex: number) => {
      const gapOptions = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3];
      const gapOptionIndex = getRandomNumberInRangeInclusive(
        0,
        gapOptions.length - 1,
      );
      const gapsCount = gapOptions[gapOptionIndex];

      let blocksCount = 8 - gapsCount;

      const blocks: Array<Block> = [];

      while (blocksCount > 0) {
        const colorIndex = getRandomNumberInRangeInclusive(
          0,
          BLOCK_COLOR_COUNT - 1,
        );
        const blockColumn = getRandomNumberInRangeInclusive(
          1,
          Math.min(4, blocksCount),
        ) as BlockColumns;

        blocksCount -= blockColumn;
        blocks.push({
          id: uuidv4(),
          columns: blockColumn,
          colorIndex,
          columnIndex: 0,
          rowIndex: rowIndex,
          x: 0,
          y: 0,
          pan: new Animated.ValueXY({x: 0, y: 0}),
          scale: new Animated.Value(1),
          ...(__DEV__ && {
            debug: {
              initialRowIndex: rowIndex,
              initialColumnIndex: 0,
              initialX: 0,
              initialY: 0,
            },
          }),
        });
      }

      const gapIndexInArray = getRandomNumberInRangeInclusive(
        0,
        blocks.length - 1,
      );
      const blocksWithIndexes = blocks.reduce((acc, item, index) => {
        const prevItem = acc[index - 1];
        let currentBlockColumnIndex = prevItem
          ? prevItem.columnIndex + prevItem.columns
          : 0;
        if (index === gapIndexInArray) {
          currentBlockColumnIndex += gapsCount;
        }

        const x = currentBlockColumnIndex * blockPixelSize;
        const y = blockPixelSize * (martixRows - item.rowIndex);

        acc.push({
          ...item,
          columnIndex: currentBlockColumnIndex,
          x,
          y,
          ...(__DEV__ && {
            debug: {
              initialRowIndex: item.rowIndex,
              initialColumnIndex: currentBlockColumnIndex,
              initialX: x,
              initialY: y,
            },
          }),
        });
        item.pan.setValue({x, y});

        return acc;
      }, [] as Array<Block>);

      return blocksWithIndexes;
    },
    [blockPixelSize, martixRows],
  );
}
