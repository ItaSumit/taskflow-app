'use strict';

(function () {
  var TM = window.TaskManager;

  var state = {
    tasks: [],
    filter: 'all'
  };

  var taskInput = document.getElementById('taskInput');
  var dueDateInput = document.getElementById('dueDateInput');
  var addTaskForm = document.getElementById('addTaskForm');
  var taskList = document.getElementById('taskList');
  var taskCount = document.getElementById('taskCount');
  var taskFooter = document.getElementById('taskFooter');
  var clearCompletedBtn = document.getElementById('clearCompleted');
  var filterBtns = document.querySelectorAll('.filter-btn');

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Formats 'YYYY-MM-DD' as e.g. 'Sep 20' without going through UTC parsing,
  // which would shift the date by a day in timezones west of UTC.
  function formatDueDate(isoDate) {
    var parts = isoDate.split('-');
    return MONTHS[Number(parts[1]) - 1] + ' ' + Number(parts[2]);
  }

  function render() {
    var visible = TM.filterTasks(state.tasks, state.filter);

    taskList.innerHTML = '';
    visible.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'task-item' +
        (task.completed ? ' completed' : '') +
        (TM.isOverdue(task) ? ' overdue' : '');
      li.dataset.id = task.id;

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', function () {
        state.tasks = TM.toggleTask(state.tasks, task.id);
        render();
      });

      var label = document.createElement('span');
      label.className = 'task-text';
      label.textContent = task.text;

      var priorityBadge = document.createElement('span');
      priorityBadge.className = 'priority-badge priority-' + task.priority;
      priorityBadge.textContent = task.priority;

      var dueLabel = null;
      if (task.dueDate) {
        dueLabel = document.createElement('span');
        dueLabel.className = 'due-date';
        dueLabel.textContent = 'Due: ' + formatDueDate(task.dueDate);
        dueLabel.title = task.dueDate;
      }

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.addEventListener('click', function () {
        state.tasks = TM.deleteTask(state.tasks, task.id);
        render();
      });

      li.appendChild(checkbox);
      li.appendChild(label);
      if (dueLabel) li.appendChild(dueLabel);
      li.appendChild(priorityBadge);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });

    var activeCount = TM.getActiveCount(state.tasks);
    taskCount.textContent = activeCount + (activeCount === 1 ? ' item left' : ' items left');

    var hasCompleted = state.tasks.some(function (t) { return t.completed; });
    taskFooter.style.display = state.tasks.length ? 'flex' : 'none';
    clearCompletedBtn.style.display = hasCompleted ? 'inline-block' : 'hidden';
  }

  function handleSubmit(event) {
    event.preventDefault();
    var text = taskInput.value.trim();
    if (!text) return;

    var prioritySelect = document.getElementById('prioritySelect');
    var priority = prioritySelect ? prioritySelect.value : 'medium';
    var dueDate = dueDateInput ? dueDateInput.value : '';

    try {
      state.tasks = TM.addTask(state.tasks, text, priority, dueDate || null);
      if (dueDateInput) dueDateInput.value = '';
      // BUG: taskInput.value is not reset — text remains after adding
      render();
    } catch (e) {
      var errorEl = document.getElementById('errorMsg');
      if (errorEl) {
        errorEl.textContent = e.message;
        setTimeout(function () { errorEl.textContent = ''; }, 3000);
      }
    }
  }

  addTaskForm.addEventListener('submit', handleSubmit);

  clearCompletedBtn.addEventListener('click', function () {
    state.tasks = TM.clearCompleted(state.tasks);
    render();
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.filter = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      render();
    });
  });

  render();
})();
