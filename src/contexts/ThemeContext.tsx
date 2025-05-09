import React, {createContext, useState, useMemo, useContext} from 'react';
import useColorScheme, {
  ColorScheme,
  EffectiveColorScheme,
} from '../hooks/useColorScheme';
import {StatusBar, useColorScheme as useDeviceColorScheme} from 'react-native';
import {View} from '../components';
import {HexColor} from '../types';

/** Ensure this constant matches the length of blockColorOptions type definition */
export const BLOCK_COLOR_COUNT = 5;

interface Theme {
  mainColor: HexColor;
  backgroundColor: HexColor;
  /** Ensure this type definition matches the length of BLOCK_COLOR_COUNT */
  blockColorOptions: [HexColor, HexColor, HexColor, HexColor, HexColor];
}

type ThemeMap = Record<EffectiveColorScheme, Theme>;

export enum ThemeNames {
  Pastel = 'Pastel',
  HighContrast = 'HighContrast',
  Retro = 'Retro',
  EightBit = 'EightBit',
  Terminal = 'Terminal',
}

export const themes: Record<ThemeNames, ThemeMap> = {
  [ThemeNames.Pastel]: {
    [EffectiveColorScheme.Light]: {
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
    [EffectiveColorScheme.Dark]: {
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
    [EffectiveColorScheme.Light]: {
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
    [EffectiveColorScheme.Dark]: {
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
    [EffectiveColorScheme.Light]: {
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
    [EffectiveColorScheme.Dark]: {
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
    [EffectiveColorScheme.Light]: {
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
    [EffectiveColorScheme.Dark]: {
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
    [EffectiveColorScheme.Light]: {
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
    [EffectiveColorScheme.Dark]: {
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
  effectiveColorScheme: EffectiveColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [colorScheme, setColorScheme] = useColorScheme();
  const deviceColorScheme = useDeviceColorScheme();
  const [themeName, setThemeName] = useState(defaultTheme);

  const effectiveColorScheme =
    colorScheme === ColorScheme.System
      ? deviceColorScheme === 'light'
        ? EffectiveColorScheme.Light
        : EffectiveColorScheme.Dark
      : colorScheme === ColorScheme.Light
      ? EffectiveColorScheme.Light
      : EffectiveColorScheme.Dark;

  const theme: Theme = useMemo(() => {
    return themes[themeName][effectiveColorScheme];
  }, [themeName, effectiveColorScheme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      themeName,
      setThemeName,
      theme,
      setColorScheme,
      colorScheme,
      effectiveColorScheme,
    }),
    [themeName, theme, setColorScheme, colorScheme, effectiveColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={
          effectiveColorScheme === EffectiveColorScheme.Dark
            ? 'light-content'
            : 'dark-content'
        }
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
