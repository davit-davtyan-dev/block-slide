import {Animated} from 'react-native';

export type HexColor = `#${string}`;

export type BlockColumns = 1 | 2 | 3 | 4;

export type Block = {
  id: string;
  rowIndex: number;
  columnIndex: number;
  columns: BlockColumns;
  colorIndex: number;
  initialX: number;
  initialY: number;
  pan: Animated.ValueXY;
};
