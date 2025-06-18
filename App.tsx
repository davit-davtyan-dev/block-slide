/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {ThemeProvider} from './src/contexts/ThemeContext';
import {SizesProvider} from './src/contexts/SizesContext';
import {GameContextProvider} from './src/contexts/GameContext';
import GameScreen from './src/GameScreen';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SizesProvider>
          <GameContextProvider>
            <GameScreen />
          </GameContextProvider>
        </SizesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
