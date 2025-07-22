/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';

import {ThemeProvider} from './src/contexts/ThemeContext';
import GameScreen from './src/GameScreen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useGameStore} from './src/store/store';
import {useGameTaskQueue} from './src/hooks/useGameTaskQueue';
import {TaskQueue, TaskType} from './src/TaskQueue';

function App(): React.JSX.Element {
  useGameTaskQueue();

  useEffect(() => {
    TaskQueue.enqueueLowPriorityTask({
      type: TaskType.AddNewRow,
      handler: () => useGameStore.getState().addNewRow(),
    });
    TaskQueue.runNext();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GameScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
