import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated} from 'react-native';
import {TaskQueue, TaskType} from '../TaskQueue';
import {useSizes} from './SizesContext';
import useGenerateRow from '../hooks/useGenerateRow';
import {doBlocksOverlap, getRowsCount} from '../helpers';
import {ANIMATION_DEFAULT_DURATION, MIN_VISIBLE_ROW_COUNT} from '../constants';

import type {Block, BlockColumns} from '../types';

type ShadowState = {
  shadowPosition?: number;
  shadowColumns?: BlockColumns;
  showShadow?: boolean;
};

type GameContextState = {
  blocks: Array<Block>;
  restart: () => void;
  shadowPosition: Animated.Value;
  shadowOpacity: Animated.Value;
  shadowSize: Animated.Value;
  setShadowState: (
    callback: (oldShadowState: ShadowState) => ShadowState | undefined,
  ) => void;
  moveBlock: (blockId: string, newColumnIndex: BlockColumns) => void;
  hasQueuedTask: boolean;
  gameOver: boolean;
};

const GameContext = createContext<GameContextState | undefined>(undefined);

type GameContextProviderProps = {children: React.ReactNode};

export const GameContextProvider = (props: GameContextProviderProps) => {
  const {blockPixelSize, martixColumns, martixRows} = useSizes();
  const generateRow = useGenerateRow();
  const [blocks, setBlocks] = useState(() => generateRow(0));
  const [hasQueuedTask, setHasQueuedTask] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const addNewRowRef = useRef<() => void>(() => {});
  const applyGravityRef = useRef<(oldBlocks: Array<Block>) => void>(() => {});
  const removeCompletedRowsRef = useRef<(oldBlocks: Array<Block>) => void>(
    () => {},
  );
  const checkIfGameIsOverRef = useRef(() => {});

  useEffect(() => {
    TaskQueue.registerOnFilled(() => {
      setHasQueuedTask(true);
    });
    TaskQueue.registerOnDrained(() => {
      checkIfGameIsOverRef.current();
      setHasQueuedTask(false);
    });
  }, []);

  useEffect(() => {
    // NOTE: start the game gracefully
    TaskQueue.enqueueLowPriorityTask({
      type: TaskType.AddNewRow,
      handler: addNewRowRef.current,
    });
    TaskQueue.runNext();
  }, []);

  const checkIfGameIsOver = useCallback(() => {
    const rowsCount = getRowsCount(blocks);
    if (rowsCount > martixRows) {
      setGameOver(true);
    }
  }, [blocks, martixRows]);

  checkIfGameIsOverRef.current = checkIfGameIsOver;

  const applyGravity = useCallback(
    (oldBlocks: Array<Block>) => {
      const orderedBlocks = oldBlocks
        .map(block => ({...block}))
        .sort((a, b) => (a.rowIndex < b.rowIndex ? -1 : 1));
      const reversedOrderedBlocks = [...orderedBlocks].reverse();

      const newBlocks: Array<Block> = [];
      const animations: Array<Animated.CompositeAnimation> = [];

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

      if (animations.length) {
        TaskQueue.enqueue({
          type: TaskType.RemoveCompletedRows,
          handler: () => removeCompletedRowsRef.current(newBlocks),
        });
        Animated.parallel(animations).start(() => {
          TaskQueue.runNext();
        });
      } else {
        TaskQueue.runNext();
      }

      setBlocks(newBlocks);
    },
    [blockPixelSize, martixRows],
  );

  const queueAddRowIfNeeded = useCallback((newBlocks: Array<Block>) => {
    const rowsCount = getRowsCount(newBlocks);
    const queuedRowAdd = TaskQueue.countTasksOfType(TaskType.AddNewRow);
    if (rowsCount + queuedRowAdd < MIN_VISIBLE_ROW_COUNT + 1) {
      TaskQueue.enqueueLowPriorityTask({
        type: TaskType.AddNewRow,
        handler: addNewRowRef.current,
      });
    }
  }, []);

  const addNewRow = useCallback(() => {
    const newRowBlocks = generateRow(0);

    setBlocks(oldBlocks => {
      const newBlocks: Array<Block> = [];
      const animations: Array<Animated.CompositeAnimation> = [];

      const countByRow: Record<number, number> = {};
      for (const block of oldBlocks) {
        const newBlock = {...block};
        newBlock.rowIndex += 1;
        countByRow[newBlock.rowIndex] =
          (countByRow[newBlock.rowIndex] || 0) + 1;
        newBlock.y = blockPixelSize * (martixRows - newBlock.rowIndex);

        newBlocks.push(newBlock);
        animations.push(
          Animated.timing(newBlock.pan.y, {
            toValue: newBlock.y,
            duration: ANIMATION_DEFAULT_DURATION,
            useNativeDriver: true,
          }),
        );
      }

      newBlocks.push(...newRowBlocks);

      TaskQueue.enqueue({
        type: TaskType.ApplyGravity,
        handler: () => applyGravityRef.current(newBlocks),
      });

      queueAddRowIfNeeded(newBlocks);
      Animated.parallel(animations).start(() => {
        TaskQueue.runNext();
      });

      return newBlocks;
    });
  }, [blockPixelSize, generateRow, martixRows, queueAddRowIfNeeded]);

  const removeCompletedRows = useCallback(
    (oldBlocks: Array<Block>) => {
      const rowColumnsByRowIndex = oldBlocks.reduce((acc, block) => {
        acc[block.rowIndex] = (acc[block.rowIndex] ?? 0) + block.columns;
        return acc;
      }, {} as {[rowIndex: string]: number});

      const completedRows = Object.keys(rowColumnsByRowIndex)
        .filter(rowIndex => rowColumnsByRowIndex[rowIndex] === martixColumns)
        .map(Number);

      const newBlocks: Array<Block> = [];
      const animations: Array<Animated.CompositeAnimation> = [];

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
        TaskQueue.enqueue({
          type: TaskType.ApplyGravity,
          handler: () => applyGravityRef.current(newBlocks),
        });
        Animated.parallel(animations).start(() => {
          setBlocks(newBlocks);
          TaskQueue.runNext();
        });
      }
      queueAddRowIfNeeded(newBlocks);
      if (!animations.length) {
        TaskQueue.runNext();
      }
    },
    [martixColumns, queueAddRowIfNeeded],
  );

  addNewRowRef.current = addNewRow;
  applyGravityRef.current = applyGravity;
  removeCompletedRowsRef.current = removeCompletedRows;

  const shadowPositionRef = useRef(new Animated.Value(0));
  const shadowOpacityRef = useRef(new Animated.Value(0));
  const shadowSizeRef = useRef(new Animated.Value(0));
  const shadowStateRef = useRef<ShadowState>({
    shadowColumns: 1,
    shadowPosition: 0,
    showShadow: false,
  });

  const restart = useCallback(() => {
    setBlocks([]);
    setGameOver(false);
    TaskQueue.enqueueLowPriorityTask({
      type: TaskType.AddNewRow,
      handler: addNewRowRef.current,
    });
    TaskQueue.runNext();
  }, []);

  const setShadowState = useCallback<GameContextState['setShadowState']>(
    callback => {
      const newState = callback(shadowStateRef.current);
      if (!newState) {
        return;
      }
      shadowStateRef.current = {...shadowStateRef.current, ...newState};

      if (newState.shadowPosition !== undefined) {
        shadowPositionRef.current.setValue(newState.shadowPosition);
      }
      if (newState.showShadow !== undefined) {
        if (newState.showShadow) {
          shadowOpacityRef.current.setValue(0.1);
        } else {
          shadowOpacityRef.current.setValue(0);
          shadowSizeRef.current.setValue(0);
        }
      }
      if (newState.shadowColumns !== undefined) {
        shadowSizeRef.current.setValue(newState.shadowColumns * blockPixelSize);
      }
    },
    [blockPixelSize],
  );

  const moveBlock = useCallback<GameContextState['moveBlock']>(
    (blockId, newColumnIndex) => {
      TaskQueue.enqueue({
        type: TaskType.ApplyGravity,
        handler: () =>
          applyGravityRef.current(
            blocks.map(block => {
              const newBlock = {...block};
              if (block.id === blockId) {
                newBlock.columnIndex = newColumnIndex;
                newBlock.x = newColumnIndex * blockPixelSize;
              }
              return newBlock;
            }),
          ),
      });
      TaskQueue.enqueueLowPriorityTask({
        type: TaskType.AddNewRow,
        handler: addNewRowRef.current,
      });
      TaskQueue.runNext();
    },
    [blocks, blockPixelSize],
  );

  const value = useMemo<GameContextState>(
    () => ({
      blocks,
      restart,
      shadowPosition: shadowPositionRef.current,
      shadowOpacity: shadowOpacityRef.current,
      shadowSize: shadowSizeRef.current,
      setShadowState,
      moveBlock,
      hasQueuedTask,
      gameOver,
    }),
    [
      blocks,
      restart,
      shadowPositionRef,
      shadowOpacityRef,
      shadowSizeRef,
      setShadowState,
      moveBlock,
      hasQueuedTask,
      gameOver,
    ],
  );

  return <GameContext value={value}>{props.children}</GameContext>;
};

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameContextProvider');
  }
  return context;
}
