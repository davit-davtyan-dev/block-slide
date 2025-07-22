import {create} from 'zustand';
import {createGameSlice} from './gameSlice';
import {createSizesSlice} from './sizesSlice';

import type {GameSlice, SizesSlice} from './types';

export const useGameStore = create<GameSlice & SizesSlice>((...a) => ({
  ...createGameSlice(...a),
  ...createSizesSlice(...a),
}));
