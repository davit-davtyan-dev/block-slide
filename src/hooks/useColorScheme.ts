import {useCallback, useEffect, useState} from 'react';
import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {useColorScheme as useReactNativeColorScheme} from 'react-native';

export type ColorScheme = 'dark' | 'light';

export default function useColorScheme(): [
  ColorScheme,
  (value: ColorScheme) => void,
] {
  const {getItem, setItem} = useAsyncStorage('COLOR_SCHEME');
  const deviceColorScheme = useReactNativeColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    deviceColorScheme || 'dark',
  );

  useEffect(() => {
    getItem().then(result => {
      if (!result) {
        return;
      }

      setColorSchemeState(result as ColorScheme);
    });
  }, [getItem]);

  const setColorScheme = useCallback(
    (value: ColorScheme) => {
      setItem(value);
      setColorSchemeState(value);
    },
    [setItem],
  );

  return [colorScheme, setColorScheme];
}
