import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated} from 'react-native';
import {BLOCK_COLOR_COUNT} from './ThemeContext';
import {useSizes} from './SizesContext';
import type {Block, BlockColumns} from '../types';

type GameContextState = {
  rows: Array<Array<Block>>;
  setRows: (rows: Array<Array<Block>>) => void;
  restart: () => void;
  shadowPosition: Animated.Value;
  shadowOpacity: Animated.Value;
  shadowSize: Animated.Value;
  setShadowState: (shadowState: {
    shadowPosition?: number;
    shadowColumns?: BlockColumns;
    showShadow?: boolean;
  }) => void;
  moveBlock: (blockId: string, newStartIndex: number) => void;
  upcomingRow: Array<Block>;
};

const GameContext = createContext<GameContextState | undefined>(undefined);

type GameContextProviderProps = {children: React.ReactNode};

function getRandomNumberInRangeInclusive(a: number, b: number) {
  const diff = Math.abs(a - b);
  const rangeStart = Math.min(a, b);
  return Math.round(Math.random() * diff) + rangeStart;
}

function generateRow() {
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
    const rangeStartNumber =
      blocks.filter(item => item.columns === 1).length >= 3 ? 2 : 1;
    const blockColumn = getRandomNumberInRangeInclusive(
      rangeStartNumber,
      Math.min(4, blocksCount),
    ) as BlockColumns;

    blocksCount -= blockColumn;
    blocks.push({
      id: `${blockColumn}-${colorIndex}`,
      columns: blockColumn,
      colorIndex,
      startIndex: 0,
    });
  }

  const gapIndexInArray = getRandomNumberInRangeInclusive(0, blocks.length - 1);
  const blocksWithIndexes = blocks.reduce((acc, item, index) => {
    const prevItem = acc[index - 1];
    let currentBlockStartIndex = prevItem
      ? prevItem.startIndex + prevItem.columns
      : 0;
    if (index === gapIndexInArray) {
      currentBlockStartIndex += gapsCount;
    }
    acc.push({
      ...item,
      id: `${item.id}-${currentBlockStartIndex}`,
      startIndex: currentBlockStartIndex,
    });

    return acc;
  }, [] as Array<Block>);

  return blocksWithIndexes;
}

export const GameContextProvider = (props: GameContextProviderProps) => {
  const {blockPixelSize} = useSizes();
  const [rows, setRows] = useState(() => {
    return [generateRow(), generateRow()];
  });
  const [upcomingRow, setUpcomingRow] = useState(generateRow);
  const shadowPositionRef = useRef(new Animated.Value(0));
  const shadowOpacityRef = useRef(new Animated.Value(0));
  const shadowSizeRef = useRef(new Animated.Value(0));

  const restart = useCallback(() => {
    setRows([generateRow(), generateRow()]);
  }, []);

  const setShadowState = useCallback<GameContextState['setShadowState']>(
    newState => {
      if (newState.shadowPosition !== undefined) {
        shadowPositionRef.current.setValue(newState.shadowPosition);
      }
      if (newState.showShadow !== undefined) {
        shadowOpacityRef.current.setValue(newState.showShadow ? 0.1 : 0);
      }
      if (newState.shadowColumns !== undefined) {
        shadowSizeRef.current.setValue(newState.shadowColumns * blockPixelSize);
      }
    },
    [blockPixelSize, shadowPositionRef, shadowOpacityRef, shadowSizeRef],
  );

  const moveBlock = useCallback<GameContextState['moveBlock']>(
    (blockId, newStartIndex) => {
      setUpcomingRow(newRow => {
        setRows(currentRows => {
          return [
            newRow,
            ...currentRows.map(row => {
              return row.map(block => {
                if (block.id === blockId) {
                  return {...block, startIndex: newStartIndex};
                }
                return block;
              });
            }),
          ];
        });

        return generateRow();
      });
    },
    [],
  );

  const value = useMemo<GameContextState>(
    () => ({
      rows,
      setRows,
      restart,
      shadowPosition: shadowPositionRef.current,
      shadowOpacity: shadowOpacityRef.current,
      shadowSize: shadowSizeRef.current,
      setShadowState,
      moveBlock,
      upcomingRow,
    }),
    [
      rows,
      setRows,
      restart,
      shadowPositionRef,
      shadowOpacityRef,
      shadowSizeRef,
      setShadowState,
      moveBlock,
      upcomingRow,
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
