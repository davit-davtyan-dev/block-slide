import {Animated} from 'react-native';

export type HexColor = `#${string}`;

export type BlockColumns = 1 | 2 | 3 | 4;

export type BlockDebug = {
  initialRowIndex: number;
  initialColumnIndex: number;
  initialX: number;
  initialY: number;
};

export type Block = {
  id: string;
  rowIndex: number;
  columnIndex: number;
  columns: BlockColumns;
  colorIndex: number;
  x: number;
  y: number;
  pan: Animated.ValueXY;
  debug?: BlockDebug;
};
