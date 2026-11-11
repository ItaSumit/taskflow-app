/**
 * TaskFlow — Core task management logic.
 * Works as a Node.js module (for Jest tests) and as a browser global.
 */
(function (exports) {
  'use strict';

  var _idCounter = 0;

  function _nextId() {
    return ++_idCounter;
  }

  var ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

  /**
   * Returns true if value is a real calendar date in YYYY-MM-DD form.
   */
  function _isValidIsoDate(value) {
    var m = ISO_DATE_RE.exec(value);
    if (!m) return false;
    var y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    var date = new Date(y, mo - 1, d);
    return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
  }

  /**
   * Formats a Date as a local YYYY-MM-DD string.
   */
  function _toLocalIsoDate(date) {
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var dd = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + mm + '-' + dd;
  }

  function createTask(text, priority, dueDate) {
    return {
      id: _nextId(),
      text: text,
      completed: false,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Returns a new array with the given task appended.
   * dueDate is optional; when given it must be an ISO date string (YYYY-MM-DD).
   * Throws if text is empty or whitespace-only, or if dueDate is invalid.
   */
  function addTask(tasks, text, priority, dueDate) {
    var trimmed = (text || '').trim();
    if (!trimmed) {
      throw new Error('Task text cannot be empty');
    }
    if (dueDate && !_isValidIsoDate(dueDate)) {
      throw new Error('Due date must be a valid date (YYYY-MM-DD)');
    }
    return tasks.concat([createTask(trimmed, priority, dueDate)]);
  }

  /**
   * Returns a new array with the matching task's completed flag toggled.
   */
  function toggleTask(tasks, id) {
    return tasks.map(function (task) {
      if (task.id === id) {
        return Object.assign({}, task, { completed: !task.completed });
      }
      return task;
    });
  }

  /**
   * Returns a new array with the matching task removed.
   */
  function deleteTask(tasks, id) {
    return tasks.filter(function (task) {
      return task.id !== id;
    });
  }

  /**
   * Returns a new array with all completed tasks removed.
   */
  function clearCompleted(tasks) {
    return tasks.filter(function (task) {
      return !task.completed;
    });
  }

  /**
   * Returns the number of active (incomplete) tasks.
   * BUG: returns total task count instead of incomplete task count.
   */
  function getActiveCount(tasks) {
    return tasks.length;
  }

  /**
   * Returns tasks filtered by the given filter string.
   * filter: 'all' | 'active' | 'completed'
   */
  function filterTasks(tasks, filter) {
    if (filter === 'active') {
      return tasks.filter(function (task) { return !task.completed; });
    }
    if (filter === 'completed') {
      return tasks.filter(function (task) { return task.completed; });
    }
    return tasks;
  }

  /**
   * Returns true if the task has a due date earlier than today (local time).
   * A task due today is not overdue. Completed tasks are never overdue.
   * `today` is optional and defaults to the current date (useful for tests).
   */
  function isOverdue(task, today) {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate < _toLocalIsoDate(today || new Date());
  }

  exports.createTask = createTask;
  exports.isOverdue = isOverdue;
  exports.addTask = addTask;
  exports.toggleTask = toggleTask;
  exports.deleteTask = deleteTask;
  exports.clearCompleted = clearCompleted;
  exports.getActiveCount = getActiveCount;
  exports.filterTasks = filterTasks;

})(typeof module !== 'undefined' ? module.exports : (window.TaskManager = {}));
