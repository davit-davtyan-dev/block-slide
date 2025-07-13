import React, {
  createContext,
  useState,
  useMemo,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {
  StatusBar,
  useColorScheme as useDeviceColorScheme,
  Animated,
  StyleSheet,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {View} from '../components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useColorScheme from '../hooks/useColorScheme';

import {ColorScheme, EffectiveColorScheme} from '../hooks/useColorScheme';
import type {HexColor} from '../types';

/** Ensure this constant matches the length of blockColorOptions type definition */
export const BLOCK_COLOR_COUNT = 5;

interface Theme {
  mainColor: HexColor;
  backgroundColor: HexColor;
  /** Ensure this type definition matches the length of BLOCK_COLOR_COUNT */
  blockColorOptions: [HexColor, HexColor, HexColor, HexColor, HexColor];
  matrixCellBackground: HexColor;
  matrixCellBorder: HexColor;
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
      matrixCellBackground: '#F0F0F0',
      matrixCellBorder: '#E0E0E0',
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
      matrixCellBackground: '#2A2A2A',
      matrixCellBorder: '#3A3A3A',
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
      matrixCellBackground: '#E0E0E0',
      matrixCellBorder: '#000000',
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
      matrixCellBackground: '#1A1A1A',
      matrixCellBorder: '#FFFFFF',
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
      matrixCellBackground: '#E8E8D0',
      matrixCellBorder: '#D4D4B0',
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
      matrixCellBackground: '#1F2F2F',
      matrixCellBorder: '#3F5F5F',
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
      matrixCellBackground: '#0000CC',
      matrixCellBorder: '#0000FF',
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
      matrixCellBackground: '#000000',
      matrixCellBorder: '#00FF00',
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
      matrixCellBackground: '#000000',
      matrixCellBorder: '#00FF00',
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
      matrixCellBackground: '#000000',
      matrixCellBorder: '#00FF00',
    },
  },
  // Add more themes...
};

const defaultTheme = ThemeNames.Pastel;

type AnimatedColorKey =
  | 'backgroundColor'
  | 'mainColor'
  | 'matrixCellBackground'
  | 'matrixCellBorder';

interface ThemeContextType {
  themeName: ThemeNames;
  setThemeName: React.Dispatch<React.SetStateAction<ThemeNames>>;
  theme: Theme;
  setColorScheme: (value: ColorScheme) => void;
  colorScheme: ColorScheme;
  effectiveColorScheme: EffectiveColorScheme;
  themeAnimation: Animated.Value;
  animatedBackgroundColor: Animated.AnimatedInterpolation<string>;
  animatedMainColor: Animated.AnimatedInterpolation<string>;
  animatedMatrixCellBackground: Animated.AnimatedInterpolation<string>;
  animatedMatrixCellBorder: Animated.AnimatedInterpolation<string>;
  animateThemeChange: () => void;
  statusBarBluryViewOpacity: Animated.Value;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [colorScheme, setColorScheme] = useColorScheme();
  const deviceColorScheme = useDeviceColorScheme();
  const [themeName, setThemeName] = useState(defaultTheme);
  const themeAnimation = useRef(new Animated.Value(1)).current;
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const safeAreaInsets = useSafeAreaInsets();
  const statusBarBluryViewOpacity = useRef(new Animated.Value(0)).current;

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

  const prevTheme = useRef(theme);

  // Generic function to create animated color interpolation
  const createAnimatedColor = useCallback(
    (colorKey: AnimatedColorKey) => {
      return themeAnimation.interpolate({
        inputRange: [currentThemeIndex - 1, currentThemeIndex],
        outputRange: [prevTheme.current[colorKey], theme[colorKey]],
      });
    },
    [themeAnimation, theme, currentThemeIndex],
  );

  const animateThemeChange = useCallback(() => {
    prevTheme.current = theme;
    setCurrentThemeIndex(oldValue => {
      const newValue = oldValue + 1;

      Animated.timing(themeAnimation, {
        toValue: newValue,
        duration: 300,
        delay: 10,
        useNativeDriver: true, // Required for color animations
      }).start();

      return newValue;
    });
  }, [themeAnimation, theme]);

  const handleThemeChange = useCallback(
    (newTheme: React.SetStateAction<ThemeNames>) => {
      animateThemeChange();
      setThemeName(newTheme);
    },
    [animateThemeChange],
  );

  const handleColorSchemeChange = useCallback(
    (newScheme: ColorScheme) => {
      animateThemeChange();
      setColorScheme(newScheme);
    },
    [animateThemeChange, setColorScheme],
  );

  const value = useMemo<ThemeContextType>(
    () => ({
      themeName,
      setThemeName: handleThemeChange,
      theme,
      setColorScheme: handleColorSchemeChange,
      colorScheme,
      effectiveColorScheme,
      themeAnimation,
      animatedBackgroundColor: createAnimatedColor('backgroundColor'),
      animatedMainColor: createAnimatedColor('mainColor'),
      animatedMatrixCellBackground: createAnimatedColor('matrixCellBackground'),
      animatedMatrixCellBorder: createAnimatedColor('matrixCellBorder'),
      animateThemeChange,
      statusBarBluryViewOpacity,
    }),
    [
      themeName,
      theme,
      colorScheme,
      effectiveColorScheme,
      themeAnimation,
      createAnimatedColor,
      handleThemeChange,
      handleColorSchemeChange,
      animateThemeChange,
      statusBarBluryViewOpacity,
    ],
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
      <View height={safeAreaInsets.top} bgColor={theme.backgroundColor}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {opacity: statusBarBluryViewOpacity},
          ]}>
          <BlurView
            style={StyleSheet.absoluteFillObject}
            blurType={effectiveColorScheme}
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          />
        </Animated.View>
      </View>
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
