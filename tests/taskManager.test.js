const {
  addTask,
  toggleTask,
  deleteTask,
  clearCompleted,
  getActiveCount,
  filterTasks
} = require('../src/taskManager');

// ── addTask ─────────────────────────────────────────────────────────────────

describe('addTask', () => {
  test('creates a task with the correct text and default properties', () => {
    const tasks = addTask([], 'Buy groceries');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe('Buy groceries');
    expect(tasks[0].completed).toBe(false);
    expect(tasks[0].id).toBeDefined();
  });

  test('trims leading and trailing whitespace from task text', () => {
    const tasks = addTask([], '  Buy groceries  ');
    expect(tasks[0].text).toBe('Buy groceries');
  });

  test('throws when task text is empty', () => {
    expect(() => addTask([], '')).toThrow('Task text cannot be empty');
  });

  test('throws when task text is whitespace only', () => {
    expect(() => addTask([], '   ')).toThrow('Task text cannot be empty');
  });

  test('appends to an existing list without mutating it', () => {
    const original = addTask([], 'Task 1');
    const updated = addTask(original, 'Task 2');
    expect(original).toHaveLength(1);
    expect(updated).toHaveLength(2);
  });
});

// ── toggleTask ───────────────────────────────────────────────────────────────

describe('toggleTask', () => {
  test('marks an incomplete task as completed', () => {
    let tasks = addTask([], 'Task 1');
    tasks = toggleTask(tasks, tasks[0].id);
    expect(tasks[0].completed).toBe(true);
  });

  test('marks a completed task back to incomplete', () => {
    let tasks = addTask([], 'Task 1');
    tasks = toggleTask(tasks, tasks[0].id);
    tasks = toggleTask(tasks, tasks[0].id);
    expect(tasks[0].completed).toBe(false);
  });

  test('only toggles the targeted task', () => {
    let tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    tasks = toggleTask(tasks, tasks[0].id);
    expect(tasks[0].completed).toBe(true);
    expect(tasks[1].completed).toBe(false);
  });

  test('does not mutate the original array', () => {
    const original = addTask([], 'Task 1');
    const updated = toggleTask(original, original[0].id);
    expect(original[0].completed).toBe(false);
    expect(updated[0].completed).toBe(true);
  });
});

// ── deleteTask ───────────────────────────────────────────────────────────────

describe('deleteTask', () => {
  test('removes a task by id', () => {
    let tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    const idToDelete = tasks[0].id;
    tasks = deleteTask(tasks, idToDelete);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe('Task 2');
  });

  test('leaves other tasks unchanged', () => {
    let tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    tasks = addTask(tasks, 'Task 3');
    tasks = deleteTask(tasks, tasks[1].id);
    expect(tasks.map(t => t.text)).toEqual(['Task 1', 'Task 3']);
  });
});

// ── clearCompleted ───────────────────────────────────────────────────────────

describe('clearCompleted', () => {
  test('removes all completed tasks and keeps active ones', () => {
    let tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    tasks = addTask(tasks, 'Task 3');
    tasks = toggleTask(tasks, tasks[0].id); // complete Task 1
    tasks = toggleTask(tasks, tasks[2].id); // complete Task 3
    tasks = clearCompleted(tasks);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe('Task 2');
  });

  test('returns the same list when no tasks are completed', () => {
    let tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    const result = clearCompleted(tasks);
    expect(result).toHaveLength(2);
  });
});

// ── getActiveCount ───────────────────────────────────────────────────────────

describe('getActiveCount', () => {
  test('returns 0 for an empty list', () => {
    expect(getActiveCount([])).toBe(0);
  });

  test('returns total count when no tasks are completed', () => {
    let tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    expect(getActiveCount(tasks)).toBe(2);
  });

  test('returns 0 when all tasks are completed', () => {
    let tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    tasks = toggleTask(tasks, tasks[0].id);
    tasks = toggleTask(tasks, tasks[1].id);
    expect(getActiveCount(tasks)).toBe(0);
  });

  // Regression test for issue #1: counter must exclude completed tasks.
  test('returns only the count of incomplete tasks when some are completed', () => {
    let tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    tasks = addTask(tasks, 'Task 3');
    tasks = toggleTask(tasks, tasks[0].id); // complete Task 1
    expect(getActiveCount(tasks)).toBe(2);
  });
});

// ── filterTasks ──────────────────────────────────────────────────────────────

describe('filterTasks', () => {
  let tasks;

  beforeEach(() => {
    tasks = addTask([], 'Task 1');
    tasks = addTask(tasks, 'Task 2');
    tasks = addTask(tasks, 'Task 3');
    tasks = toggleTask(tasks, tasks[0].id); // Task 1 is completed
  });

  test('"all" filter returns every task', () => {
    expect(filterTasks(tasks, 'all')).toHaveLength(3);
  });

  test('"active" filter returns only incomplete tasks', () => {
    const active = filterTasks(tasks, 'active');
    expect(active).toHaveLength(2);
    expect(active.every(t => !t.completed)).toBe(true);
  });

  test('"completed" filter returns only completed tasks', () => {
    const completed = filterTasks(tasks, 'completed');
    expect(completed).toHaveLength(1);
    expect(completed[0].text).toBe('Task 1');
  });

  test('unknown filter defaults to returning all tasks', () => {
    expect(filterTasks(tasks, 'unknown')).toHaveLength(3);
  });
});
