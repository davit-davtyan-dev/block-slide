export enum TaskType {
  ApplyGravity = 'ApplyGravity',
  RemoveCompletedRows = 'RemoveCompletedRows',
  AddNewRow = 'AddNewRow',
}

type Task = {
  type: TaskType;
  handler: () => void;
};

export class TaskQueue {
  static tasks: Array<Task> = [];
  static lowPriorityTasks: Array<Task> = [];
  static onFilled: () => void;
  static onDrained: () => void;
  private static isDrained = true;

  private static onEnqueue() {
    // NOTE: make sure to call onFilled once
    if (this.isDrained) {
      this.onFilled?.();
    }
    this.isDrained = false;
  }

  static enqueue(task: Task) {
    this.tasks.push(task);
    this.onEnqueue();
  }
  static enqueueLowPriorityTask(task: Task) {
    this.lowPriorityTasks.push(task);
    this.onEnqueue();
  }

  static hasTaskOfType(type: TaskType) {
    return (
      this.tasks.some(task => task.type === type) ||
      this.lowPriorityTasks.some(lpTask => lpTask.type === type)
    );
  }

  static runNext() {
    setImmediate(() => {
      if (this.tasks.length) {
        const nextTask = this.tasks.shift() as Task;
        nextTask.handler();
      } else if (this.lowPriorityTasks.length) {
        const nextLowPriorityTask = this.lowPriorityTasks.shift() as Task;
        nextLowPriorityTask.handler();
      } else if (!this.isDrained) {
        this.onDrained?.();
        this.isDrained = true;
      }
    });
  }

  static registerOnFilled(callback: () => void) {
    this.onFilled = callback;
  }
  static registerOnDrained(callback: () => void) {
    this.onDrained = callback;
  }
}
