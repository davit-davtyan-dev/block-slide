/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';

import {ThemeProvider} from './src/contexts/ThemeContext';
import {SizesProvider} from './src/contexts/SizesContext';
import GameScreen from './src/GameScreen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useGameStore} from './src/store/gameStore';
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
        <SizesProvider>
          <GameScreen />
        </SizesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
