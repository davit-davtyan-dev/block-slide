import React, {createContext, useMemo, useContext} from 'react';
import {useWindowDimensions} from 'react-native';

// TODO: in future, make this dynamic
const matrixMargin = 32;
const martixRows = 10;
const martixColumns = 8;

interface SizesContextType {
  matrixWidth: number;
  matrixHeight: number;
  blockPixelSize: number;
  martixRows: number;
  martixColumns: number;
}

const SizesContext = createContext<SizesContextType | undefined>(undefined);

export const SizesProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const dimensions = useWindowDimensions();
  const blockPixelSize = Math.round(
    (dimensions.width - matrixMargin * 2) / martixColumns,
  );
  const matrixWidth = blockPixelSize * martixColumns;
  const matrixHeight = blockPixelSize * martixRows;

  const value = useMemo<SizesContextType>(
    () => ({
      matrixWidth,
      matrixHeight,
      blockPixelSize,
      martixRows,
      martixColumns,
    }),
    [matrixWidth, matrixHeight, blockPixelSize],
  );

  return (
    <SizesContext.Provider value={value}>{children}</SizesContext.Provider>
  );
};

export function useSizes() {
  const context = useContext(SizesContext);
  if (!context) {
    throw new Error('useSizesContext must be used within a SizesProvider');
  }
  return context;
}
