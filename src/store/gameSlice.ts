import {Animated} from 'react-native';
import {StateCreator} from 'zustand';
import {TaskQueue, TaskType} from '../TaskQueue';
import {doBlocksOverlap, generateRow, getRowsCount} from '../helpers';
import {ANIMATION_DEFAULT_DURATION, MIN_VISIBLE_ROW_COUNT} from '../constants';

import type {Block} from '../types';
import type {GameSlice, GameState, SizesSlice} from './types';

const initialState: GameState = {
  blocks: [],
  hasQueuedTask: false,
  gameOver: false,
  shadowState: {
    shadowColumns: 1,
    shadowPosition: 0,
    showShadow: false,
  },
  shadowPosition: new Animated.Value(0),
  shadowOpacity: new Animated.Value(0),
  shadowSize: new Animated.Value(0),
};

export const createGameSlice: StateCreator<
  GameSlice & SizesSlice,
  [],
  [],
  GameSlice
> = (set, get) => ({
  ...initialState,
  setHasQueuedTask: hasQueuedTask => set({hasQueuedTask}),

  setShadowState: callback => {
    const currentState = get();
    const newState = callback(currentState.shadowState);
    if (newState) {
      set({shadowState: {...currentState.shadowState, ...newState}});
      if (newState.shadowPosition !== undefined) {
        currentState.shadowPosition.setValue(newState.shadowPosition);
      }
      if (newState.showShadow !== undefined) {
        if (newState.showShadow) {
          currentState.shadowOpacity.setValue(0.1);
        } else {
          currentState.shadowOpacity.setValue(0);
          currentState.shadowSize.setValue(0);
        }
      }
      if (newState.shadowColumns !== undefined) {
        currentState.shadowSize.setValue(
          newState.shadowColumns * currentState.blockPixelSize,
        );
      }
    }
  },

  addNewRow: () => {
    const {blocks, blockPixelSize, martixRows, applyGravity} = get();
    const newRowBlocks = generateRow(0, blockPixelSize, martixRows);

    // Animate and update existing blocks
    const updatedBlocks: Block[] = [];
    const animations: Animated.CompositeAnimation[] = [];
    for (const block of blocks) {
      const newBlock = {...block};
      newBlock.rowIndex += 1;
      newBlock.y = blockPixelSize * (martixRows - newBlock.rowIndex);
      updatedBlocks.push(newBlock);
      animations.push(
        Animated.timing(newBlock.pan.y, {
          toValue: newBlock.y,
          duration: ANIMATION_DEFAULT_DURATION,
          useNativeDriver: true,
        }),
      );
    }

    const allBlocks = [...updatedBlocks, ...newRowBlocks];
    set({blocks: allBlocks});

    // Enqueue ApplyGravity as the next task
    TaskQueue.enqueue({
      type: TaskType.ApplyGravity,
      handler: () => applyGravity(allBlocks),
    });

    Animated.parallel(animations).start(() => {
      TaskQueue.runNext();
    });
  },

  applyGravity: oldBlocks => {
    const {blockPixelSize, martixRows, removeCompletedRows} = get();
    const orderedBlocks = oldBlocks
      .map(block => ({...block}))
      .sort((a, b) => (a.rowIndex < b.rowIndex ? -1 : 1));
    const reversedOrderedBlocks = [...orderedBlocks].reverse();

    const newBlocks: Block[] = [];
    const animations: Animated.CompositeAnimation[] = [];

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
      const oldRowIndex = block.rowIndex;
      if (!nearestBlocksBelow.length) {
        block.rowIndex = 1;
      } else {
        const nearestBlockBelowIndex = Math.max(
          ...nearestBlocksBelow.map(item => item.rowIndex),
        );
        block.rowIndex = nearestBlockBelowIndex + 1;
      }
      block.y = blockPixelSize * (martixRows - block.rowIndex);
      if (oldRowIndex !== block.rowIndex) {
        animations.push(
          Animated.timing(block.pan.y, {
            toValue: block.y,
            duration: ANIMATION_DEFAULT_DURATION,
            useNativeDriver: true,
          }),
        );
      }
      newBlocks.push(block);
    }

    set({blocks: newBlocks});

    // Enqueue RemoveCompletedRows as the next task
    TaskQueue.enqueue({
      type: TaskType.RemoveCompletedRows,
      handler: () => removeCompletedRows(newBlocks),
    });

    if (animations.length) {
      Animated.parallel(animations).start(() => {
        TaskQueue.runNext();
      });
    } else {
      TaskQueue.runNext();
    }
  },

  removeCompletedRows: oldBlocks => {
    const {martixColumns, applyGravity, queueAddRowIfNeeded} = get();
    const rowColumnsByRowIndex = oldBlocks.reduce((acc, block) => {
      acc[block.rowIndex] = (acc[block.rowIndex] ?? 0) + block.columns;
      return acc;
    }, {} as {[rowIndex: string]: number});

    const completedRows = Object.keys(rowColumnsByRowIndex)
      .filter(rowIndex => rowColumnsByRowIndex[rowIndex] === martixColumns)
      .map(Number);

    const newBlocks: Block[] = [];
    const animations: Animated.CompositeAnimation[] = [];

    for (const block of oldBlocks) {
      if (!completedRows.includes(block.rowIndex)) {
        newBlocks.push(block);
      } else {
        animations.push(
          Animated.timing(block.scale, {
            toValue: 0,
            duration: ANIMATION_DEFAULT_DURATION,
            useNativeDriver: true,
          }),
        );
      }
    }

    if (animations.length) {
      // If rows were removed, enqueue ApplyGravity for the new blocks
      TaskQueue.enqueue({
        type: TaskType.ApplyGravity,
        handler: () => applyGravity(newBlocks),
      });
      Animated.parallel(animations).start(() => {
        set({blocks: newBlocks});
        queueAddRowIfNeeded(newBlocks);
        TaskQueue.runNext();
      });
    } else {
      set({blocks: newBlocks});
      queueAddRowIfNeeded(newBlocks);
      TaskQueue.runNext();
    }
  },

  moveBlock: (blockId, newColumnIndex) => {
    const {blocks, blockPixelSize, applyGravity, addNewRow} = get();
    const updatedBlocks = blocks.map(block => {
      const newBlock = {...block};
      if (block.id === blockId) {
        newBlock.columnIndex = newColumnIndex;
        newBlock.x = newColumnIndex * blockPixelSize;
      }
      return newBlock;
    });
    // Enqueue ApplyGravity with updated blocks
    TaskQueue.enqueue({
      type: TaskType.ApplyGravity,
      handler: () => applyGravity(updatedBlocks),
    });
    // Enqueue low-priority AddNewRow
    TaskQueue.enqueueLowPriorityTask({
      type: TaskType.AddNewRow,
      handler: () => addNewRow(),
    });
    TaskQueue.runNext();
  },

  restart: () => {
    set({blocks: [], gameOver: false});
    TaskQueue.enqueueLowPriorityTask({
      type: TaskType.AddNewRow,
      handler: () => get().addNewRow(),
    });
    TaskQueue.runNext();
  },

  checkIfGameIsOver: () => {
    const {blocks, martixRows} = get();
    const rowsCount = getRowsCount(blocks);
    if (rowsCount > martixRows) {
      set({gameOver: true});
    }
  },

  queueAddRowIfNeeded: (newBlocks: Block[]) => {
    const rowsCount = getRowsCount(newBlocks);
    const queuedRowAdd = TaskQueue.countTasksOfType(TaskType.AddNewRow);
    if (rowsCount + queuedRowAdd < MIN_VISIBLE_ROW_COUNT + 1) {
      TaskQueue.enqueueLowPriorityTask({
        type: TaskType.AddNewRow,
        handler: () => get().addNewRow(),
      });
    }
  },
});
