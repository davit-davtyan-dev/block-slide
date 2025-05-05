import {useCallback} from 'react';
import {Animated} from 'react-native';
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
          id: `${rowIndex}-${blockColumn}-${colorIndex}`,
          columns: blockColumn,
          colorIndex,
          columnIndex: 0,
          rowIndex: rowIndex,
          initialX: 0,
          initialY: 0,
          pan: new Animated.ValueXY({x: 0, y: 0}),
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

        const initialX = currentBlockColumnIndex * blockPixelSize;
        const initialY = blockPixelSize * (martixRows - item.rowIndex);

        acc.push({
          ...item,
          id: `${item.id}-${currentBlockColumnIndex}`,
          columnIndex: currentBlockColumnIndex,
          initialX,
          initialY,
        });
        item.pan.setValue({x: initialX, y: initialY});

        return acc;
      }, [] as Array<Block>);

      return blocksWithIndexes;
    },
    [blockPixelSize, martixRows],
  );
}
