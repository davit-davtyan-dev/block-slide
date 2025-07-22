import {useEffect} from 'react';
import {TaskQueue} from '../TaskQueue';
import {useGameStore} from '../store/store';

export function useGameTaskQueue() {
  const setHasQueuedTask = useGameStore(state => state.setHasQueuedTask);
  const checkIfGameIsOver = useGameStore(state => state.checkIfGameIsOver);

  useEffect(() => {
    const onFilled = () => {
      setHasQueuedTask(true);
    };
    const onDrained = () => {
      checkIfGameIsOver();
      setHasQueuedTask(false);
    };
    TaskQueue.registerOnFilled(onFilled);
    TaskQueue.registerOnDrained(onDrained);
    return () => {
      TaskQueue.unregisterOnFilled(onFilled);
      TaskQueue.unregisterOnDrained(onDrained);
    };
  }, [setHasQueuedTask, checkIfGameIsOver]);
}
