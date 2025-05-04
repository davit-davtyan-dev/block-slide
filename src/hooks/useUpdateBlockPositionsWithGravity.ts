import {useCallback} from 'react';
import {useSizes} from '../contexts/SizesContext';
import {doBlocksOverlap} from '../helpers';
import type {Block} from '../types';

export default function useUpdateBlockPositionsWithGravity() {
  const {blockPixelSize, martixRows} = useSizes();

  return useCallback(
    (blocks: Array<Block>) => {
      const orderedBlocks = [...blocks].sort((a, b) =>
        a.rowIndex < b.rowIndex ? -1 : 1,
      );

      const newBlocks: Array<Block> = [];

      for (const block of orderedBlocks) {
        const newBlock = {...block};
        if (newBlock.rowIndex <= 1) {
          newBlocks.push(newBlock);
          continue;
        }
        const nearestBlockBelow = orderedBlocks.find(
          blockBelow =>
            blockBelow.rowIndex !== 0 &&
            blockBelow.rowIndex < newBlock.rowIndex &&
            doBlocksOverlap(newBlock, blockBelow),
        );
        if (!nearestBlockBelow) {
          newBlock.rowIndex = 1;
        } else {
          newBlock.rowIndex = nearestBlockBelow.rowIndex + 1;
        }
        newBlock.initialY = blockPixelSize * (martixRows - newBlock.rowIndex);
        newBlocks.push(newBlock);
      }

      return newBlocks;
    },
    [blockPixelSize, martixRows],
  );
}
