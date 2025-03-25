import React, {createContext, useState, useMemo, useContext} from 'react';
import useColorScheme, {ColorScheme} from '../hooks/useColorScheme';
import {StatusBar} from 'react-native';
import {View} from '../components';
import {HexColor} from '../types';

/** Ensure this constant matches the length of blockColorOptions type definition */
export const BLOCK_COLOR_COUNT = 5;

interface Theme {
  mainColor: string;
  backgroundColor: string;
  /** Ensure this type definition matches the length of BLOCK_COLOR_COUNT */
  blockColorOptions: [HexColor, HexColor, HexColor, HexColor, HexColor];
}

interface ThemeMap {
  light: Theme;
  dark: Theme;
}

export enum ThemeNames {
  Pastel = 'Pastel',
  HighContrast = 'HighContrast',
  Retro = 'Retro',
  EightBit = 'EightBit',
  Terminal = 'Terminal',
}

export const themes: Record<ThemeNames, ThemeMap> = {
  [ThemeNames.Pastel]: {
    light: {
      mainColor: '#FFB3BA',
      backgroundColor: '#FFF0F0',
      blockColorOptions: [
        '#FFB3BA',
        '#FFDFBA',
        '#FFFFBA',
        '#BAFFC9',
        '#BAE1FF',
      ],
    },
    dark: {
      mainColor: '#FF6961',
      backgroundColor: '#330000',
      blockColorOptions: [
        '#FF6961',
        '#FFB347',
        '#FDFD96',
        '#77DD77',
        '#AEC6CF',
      ],
    },
  },
  [ThemeNames.HighContrast]: {
    light: {
      mainColor: '#000000',
      backgroundColor: '#FFFFFF',
      blockColorOptions: [
        '#000000',
        '#FFFFFF',
        '#FF0000',
        '#00FF00',
        '#0000FF',
      ],
    },
    dark: {
      mainColor: '#FFFFFF',
      backgroundColor: '#000000',
      blockColorOptions: [
        '#FFFFFF',
        '#000000',
        '#FF0000',
        '#00FF00',
        '#0000FF',
      ],
    },
  },
  [ThemeNames.Retro]: {
    light: {
      mainColor: '#FFD700',
      backgroundColor: '#F5F5DC',
      blockColorOptions: [
        '#FFD700',
        '#FF8C00',
        '#FF4500',
        '#32CD32',
        '#1E90FF',
      ],
    },
    dark: {
      mainColor: '#DAA520',
      backgroundColor: '#2F4F4F',
      blockColorOptions: [
        '#DAA520',
        '#FF8C00',
        '#FF4500',
        '#32CD32',
        '#1E90FF',
      ],
    },
  },
  [ThemeNames.EightBit]: {
    light: {
      mainColor: '#00FF00',
      backgroundColor: '#0000FF',
      blockColorOptions: [
        '#00FF00',
        '#FF0000',
        '#FFFF00',
        '#0000FF',
        '#FF00FF',
      ],
    },
    dark: {
      mainColor: '#00FF00',
      backgroundColor: '#000000',
      blockColorOptions: [
        '#00FF00',
        '#FF0000',
        '#FFFF00',
        '#0000FF',
        '#FF00FF',
      ],
    },
  },
  [ThemeNames.Terminal]: {
    light: {
      mainColor: '#00FF00',
      backgroundColor: '#000000',
      blockColorOptions: [
        '#00FF00',
        '#FF0000',
        '#FFFF00',
        '#0000FF',
        '#FF00FF',
      ],
    },
    dark: {
      mainColor: '#00FF00',
      backgroundColor: '#000000',
      blockColorOptions: [
        '#00FF00',
        '#FF0000',
        '#FFFF00',
        '#0000FF',
        '#FF00FF',
      ],
    },
  },
  // Add more themes...
};

const defaultTheme = ThemeNames.Pastel;

interface ThemeContextType {
  themeName: ThemeNames;
  setThemeName: React.Dispatch<React.SetStateAction<ThemeNames>>;
  theme: Theme;
  setColorScheme: (value: ColorScheme) => void;
  colorScheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [colorScheme, setColorScheme] = useColorScheme();
  const [themeName, setThemeName] = useState(defaultTheme);

  const theme: Theme = useMemo(() => {
    return themes[themeName][colorScheme];
  }, [themeName, colorScheme]);

  const value = useMemo(
    () => ({
      themeName,
      setThemeName,
      theme,
      setColorScheme,
      colorScheme,
    }),
    [themeName, theme, setColorScheme, colorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View height={StatusBar.currentHeight} bgColor={theme.backgroundColor} />
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
