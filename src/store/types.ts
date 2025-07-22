import type {Animated} from 'react-native';
import type {Block, BlockColumns} from '../types';

// Shadow state type
type ShadowState = {
  shadowPosition?: number;
  shadowColumns?: BlockColumns;
  showShadow?: boolean;
};

export interface GameState {
  blocks: Block[];
  hasQueuedTask: boolean;
  gameOver: boolean;

  // Shadow state
  shadowState: ShadowState;
  shadowPosition: Animated.Value;
  shadowOpacity: Animated.Value;
  shadowSize: Animated.Value;
}

export interface GameActions {
  setHasQueuedTask: (hasQueuedTask: boolean) => void;
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

export interface GameSlice extends GameState, GameActions {}

export interface SizesSlice {
  matrixWidth: number;
  matrixHeight: number;
  blockPixelSize: number;
  martixRows: number;
  martixColumns: number;
}
