/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {MainContextProvider} from './src/contexts/MainContext';
import {ThemeProvider} from './src/contexts/ThemeContext';
import GameScreen from './src/GameScreen';

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <MainContextProvider>
        <GameScreen />
      </MainContextProvider>
    </ThemeProvider>
  );
}

export default App;
