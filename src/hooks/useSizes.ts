import {useWindowDimensions} from 'react-native';

const matrixMargin = 32;
const martixRows = 10;
const martixColumns = 8;

export default function useSizes() {
  const dimensions = useWindowDimensions();
  const blockPixelSize = Math.round(
    (dimensions.width - matrixMargin * 2) / martixColumns,
  );
  const matrixWidth = blockPixelSize * martixColumns;
  const matrixHeight = blockPixelSize * martixRows;

  return {
    matrixWidth,
    matrixHeight,
    blockPixelSize,
    martixRows,
    martixColumns,
  };
}
