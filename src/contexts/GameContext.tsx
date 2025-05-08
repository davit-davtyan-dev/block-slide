import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated} from 'react-native';
import {useSizes} from './SizesContext';
import useGenerateRow from '../hooks/useGenerateRow';
import useUpdateBlockPositionsWithGravity from '../hooks/useUpdateBlockPositionsWithGravity';
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
};

const GameContext = createContext<GameContextState | undefined>(undefined);

type GameContextProviderProps = {children: React.ReactNode};

function removeCompletedRows(blocks: Array<Block>, martixColumns: number) {
  const rowColumnsByRowIndex = blocks.reduce((acc, block) => {
    acc[block.rowIndex] = (acc[block.rowIndex] ?? 0) + block.columns;
    return acc;
  }, {} as {[rowIndex: string]: number});

  const completedRows = Object.keys(rowColumnsByRowIndex)
    .filter(rowIndex => rowColumnsByRowIndex[rowIndex] === martixColumns)
    .map(Number);

  return blocks.filter(block => !completedRows.includes(block.rowIndex));
}

export const GameContextProvider = (props: GameContextProviderProps) => {
  const {blockPixelSize, martixColumns} = useSizes();
  const generateRow = useGenerateRow();
  const [blocks, setBlocks] = useState(() => [
    ...generateRow(0),
    ...generateRow(1),
    ...generateRow(2),
    ...generateRow(3),
  ]);
  const updateBlockPositionsWithGravity = useUpdateBlockPositionsWithGravity(
    useCallback(() => {
      setBlocks(oldBlocks => {
        const newBlocks = removeCompletedRows(oldBlocks, martixColumns);
        if (newBlocks.length === oldBlocks.length) {
          return [...newBlocks, ...generateRow(0)];
        } else {
          updateBlockPositionsWithGravity(newBlocks);
          return newBlocks;
        }
      });
    }, [martixColumns, generateRow]),
  );

  const shadowPositionRef = useRef(new Animated.Value(0));
  const shadowOpacityRef = useRef(new Animated.Value(0));
  const shadowSizeRef = useRef(new Animated.Value(0));
  const shadowStateRef = useRef<ShadowState>({
    shadowColumns: 1,
    shadowPosition: 0,
    showShadow: false,
  });

  const restart = useCallback(() => {
    setBlocks([
      ...generateRow(0),
      ...generateRow(1),
      ...generateRow(2),
      ...generateRow(3),
    ]);
  }, [generateRow]);

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
    [
      blockPixelSize,
      shadowPositionRef,
      shadowOpacityRef,
      shadowSizeRef,
      shadowStateRef,
    ],
  );

  const moveBlock = useCallback<GameContextState['moveBlock']>(
    (blockId, newColumnIndex) => {
      setBlocks(oldBlocks => {
        const newBlocks = updateBlockPositionsWithGravity(
          oldBlocks.map(block => {
            if (block.id === blockId) {
              return {...block, columnIndex: newColumnIndex};
            }
            return block;
          }),
        );
        return newBlocks;
      });
    },
    [updateBlockPositionsWithGravity],
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
    }),
    [
      blocks,
      restart,
      shadowPositionRef,
      shadowOpacityRef,
      shadowSizeRef,
      setShadowState,
      moveBlock,
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
