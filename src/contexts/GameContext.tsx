import {createContext, useCallback, useContext, useState} from 'react';
import {BLOCK_COLOR_COUNT} from './ThemeContext';
import type {LayoutRectangle} from 'react-native';
import type {Block, BlockColumns} from '../types';

type GameContextState = {
  matrixLayout: LayoutRectangle | null;
  setMatrixLayout: (matrixLayout: LayoutRectangle) => void;
  rows: Array<Array<Block>>;
  setRows: (rows: Array<Array<Block>>) => void;
  restart: () => void;
  shadowColumns: BlockColumns;
  shadowPosition: number;
  showShadow: boolean;
  setShadowState: (shadowState: {
    shadowPosition?: number;
    shadowColumns?: BlockColumns;
    showShadow?: boolean;
  }) => void;
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
  const [matrixLayout, setMatrixLayout] =
    useState<GameContextState['matrixLayout']>(null);
  const [rows, setRows] = useState(() => {
    return [generateRow(), generateRow()];
  });
  const [shadowColumns, setShadowColumns] = useState<BlockColumns>(1);
  const [shadowPosition, setShadowPosition] = useState(0);
  const [showShadow, setShowShadow] = useState(false);

  const restart = useCallback(() => {
    setRows([generateRow(), generateRow()]);
  }, []);

  const setShadowState = useCallback<GameContextState['setShadowState']>(
    newState => {
      if (newState.shadowColumns !== undefined) {
        setShadowColumns(newState.shadowColumns);
      }
      if (newState.shadowPosition !== undefined) {
        setShadowPosition(newState.shadowPosition);
      }
      if (newState.showShadow !== undefined) {
        setShowShadow(newState.showShadow);
      }
    },
    [],
  );

  return (
    <GameContext
      value={{
        matrixLayout,
        setMatrixLayout,
        rows,
        setRows,
        restart,
        shadowPosition,
        shadowColumns,
        showShadow,
        setShadowState,
      }}>
      {props.children}
    </GameContext>
  );
};

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameContextProvider');
  }
  return context;
}
