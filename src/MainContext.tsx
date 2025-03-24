import {createContext, useCallback, useState} from 'react';
import {makeColorPastel} from './helpers';
import type {LayoutRectangle} from 'react-native';
import type {Block, BlockColumns, HexColor} from './types';

const baseColors: Array<HexColor> = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#00FFFF',
  '#FF00FF',
];
const colorOptions = baseColors.map(makeColorPastel);

type MainContextState = {
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

const initialState: MainContextState = {
  matrixLayout: null,
  setMatrixLayout: () => {},
  rows: [],
  setRows: () => {},
  restart: () => {},
  shadowColumns: 1,
  shadowPosition: 0,
  showShadow: false,
  setShadowState: () => {},
};

export const MainContext = createContext(initialState);

type MainContextProviderProps = {children: React.ReactNode};

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
      colorOptions.length - 1,
    );
    const rangeStartNumber =
      blocks.filter(item => item.columns === 1).length >= 3 ? 2 : 1;
    const blockColumn = getRandomNumberInRangeInclusive(
      rangeStartNumber,
      Math.min(4, blocksCount),
    ) as BlockColumns;

    blocksCount -= blockColumn;
    blocks.push({
      id: `${blockColumn}-${colorOptions[colorIndex]}`,
      columns: blockColumn,
      color: colorOptions[colorIndex],
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

export const MainContextProvider = (props: MainContextProviderProps) => {
  const [matrixLayout, setMatrixLayout] =
    useState<MainContextState['matrixLayout']>(null);
  const [rows, setRows] = useState(() => {
    return [generateRow(), generateRow()];
  });
  const [shadowColumns, setShadowColumns] = useState(
    initialState.shadowColumns,
  );
  const [shadowPosition, setShadowPosition] = useState(
    initialState.shadowPosition,
  );
  const [showShadow, setShowShadow] = useState(initialState.showShadow);

  const restart = useCallback(() => {
    setRows([generateRow(), generateRow()]);
  }, []);

  const setShadowState = useCallback<MainContextState['setShadowState']>(
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
    <MainContext
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
    </MainContext>
  );
};
