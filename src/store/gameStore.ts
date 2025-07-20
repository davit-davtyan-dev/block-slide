import {create} from 'zustand';
import {Animated, Dimensions} from 'react-native';
import {TaskQueue, TaskType} from '../TaskQueue';
import {doBlocksOverlap, generateRow, getRowsCount} from '../helpers';
import {ANIMATION_DEFAULT_DURATION, MIN_VISIBLE_ROW_COUNT} from '../constants';
import type {Block, BlockColumns} from '../types';

const dimensions = Dimensions.get('window');
const matrixMargin = 32;
const martixRows = 10;
const martixColumns = 8;

const blockPixelSize = Math.round(
  (dimensions.width - matrixMargin * 2) / martixColumns,
);
const matrixWidth = blockPixelSize * martixColumns;
const matrixHeight = blockPixelSize * martixRows;

// Shadow state type
type ShadowState = {
  shadowPosition?: number;
  shadowColumns?: BlockColumns;
  showShadow?: boolean;
};

interface GameState {
  // State
  blocks: Block[];
  hasQueuedTask: boolean;
  gameOver: boolean;

  // Shadow state
  shadowState: ShadowState;
  shadowPosition: Animated.Value;
  shadowOpacity: Animated.Value;
  shadowSize: Animated.Value;

  // Actions
  setBlocks: (blocks: Block[]) => void;
  setHasQueuedTask: (hasQueuedTask: boolean) => void;
  setGameOver: (gameOver: boolean) => void;
  setShadowState: (
    callback: (oldShadowState: ShadowState) => ShadowState | undefined,
  ) => void;

  // Game logic actions
  addNewRow: () => void;
  applyGravity: (oldBlocks: Block[]) => void;
  removeCompletedRows: (oldBlocks: Block[]) => void;
  moveBlock: (blockId: string, newColumnIndex: BlockColumns) => void;
  restart: () => void;
  checkIfGameIsOver: () => void;
  queueAddRowIfNeeded: (newBlocks: Block[]) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  blocks: [],
  hasQueuedTask: false,
  gameOver: false,
  martixColumns,
  matrixWidth,
  matrixHeight,
  shadowState: {
    shadowColumns: 1,
    shadowPosition: 0,
    showShadow: false,
  },
  shadowPosition: new Animated.Value(0),
  shadowOpacity: new Animated.Value(0),
  shadowSize: new Animated.Value(0),

  // Basic setters
  setBlocks: blocks => set({blocks}),
  setHasQueuedTask: hasQueuedTask => set({hasQueuedTask}),
  setGameOver: gameOver => set({gameOver}),

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
          newState.shadowColumns * blockPixelSize,
        );
      }
    }
  },

  addNewRow: () => {
    const {blocks, applyGravity} = get();
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
    const {removeCompletedRows} = get();
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
    const {applyGravity, queueAddRowIfNeeded} = get();
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
    const {blocks, applyGravity, addNewRow} = get();
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
    const {blocks} = get();
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
}));
