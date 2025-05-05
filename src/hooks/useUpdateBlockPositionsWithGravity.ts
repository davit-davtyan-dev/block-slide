import {useCallback} from 'react';
import {useSizes} from '../contexts/SizesContext';
import {doBlocksOverlap} from '../helpers';
import type {Block} from '../types';

export default function useUpdateBlockPositionsWithGravity() {
  const {blockPixelSize, martixRows} = useSizes();

  return useCallback(
    (blocks: Array<Block>) => {
      const orderedBlocks = blocks
        .map(block => ({...block}))
        .sort((a, b) => (a.rowIndex < b.rowIndex ? -1 : 1));
      const reversedOrderedBlocks = [...orderedBlocks].reverse();

      const newBlocks: Array<Block> = [];

      for (const block of orderedBlocks) {
        if (block.rowIndex <= 1) {
          newBlocks.push(block);
          continue;
        }
        const nearestBlocksBelow = reversedOrderedBlocks.filter(
          blockBelow =>
            blockBelow.rowIndex !== 0 &&
            blockBelow.rowIndex < block.rowIndex &&
            doBlocksOverlap(block, blockBelow),
        );
        if (!nearestBlocksBelow.length) {
          block.rowIndex = 1;
        } else {
          const nearestBlockBelowIndex = Math.max(
            ...nearestBlocksBelow.map(item => item.rowIndex),
          );
          block.rowIndex = nearestBlockBelowIndex + 1;
        }
        block.initialY = blockPixelSize * (martixRows - block.rowIndex);
        newBlocks.push(block);
      }

      return newBlocks;
    },
    [blockPixelSize, martixRows],
  );
}
