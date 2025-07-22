import {StateCreator} from 'zustand';
import {GameSlice, SizesSlice} from './types';
import {Dimensions} from 'react-native';

// TODO: in future, make this dynamic
const matrixMargin = 32;
const martixRows = 10;
const martixColumns = 8;

const dimensions = Dimensions.get('window');

const blockPixelSize = Math.round(
  (dimensions.width - matrixMargin * 2) / martixColumns,
);

const initialState: SizesSlice = {
  matrixWidth: blockPixelSize * martixColumns,
  matrixHeight: blockPixelSize * martixRows,
  blockPixelSize,
  martixRows,
  martixColumns,
};

export const createSizesSlice: StateCreator<
  GameSlice & SizesSlice,
  [],
  [],
  SizesSlice
> = () => ({
  ...initialState,
});
