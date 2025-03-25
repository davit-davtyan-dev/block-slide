/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {GameContextProvider} from './src/contexts/GameContext';
import {ThemeProvider} from './src/contexts/ThemeContext';
import GameScreen from './src/GameScreen';

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <GameContextProvider>
        <GameScreen />
      </GameContextProvider>
    </ThemeProvider>
  );
}

export default App;
