/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {useColorScheme} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {View} from './src/components';
import {MainContextProvider} from './src/MainContext';
import GameScreen from './src/GameScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View center h="100%" bgColor={isDarkMode ? Colors.darker : Colors.lighter}>
      <MainContextProvider>
        <GameScreen />
      </MainContextProvider>
    </View>
  );
}

export default App;
