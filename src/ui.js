'use strict';

(function () {
  var TM = window.TaskManager;

  var state = {
    tasks: [],
    filter: 'all'
  };

  var taskInput = document.getElementById('taskInput');
  var addTaskForm = document.getElementById('addTaskForm');
  var taskList = document.getElementById('taskList');
  var taskCount = document.getElementById('taskCount');
  var taskFooter = document.getElementById('taskFooter');
  var clearCompletedBtn = document.getElementById('clearCompleted');
  var filterBtns = document.querySelectorAll('.filter-btn');

  function render() {
    var visible = TM.filterTasks(state.tasks, state.filter);

    taskList.innerHTML = '';
    visible.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
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

    try {
      state.tasks = TM.addTask(state.tasks, text, priority);
      taskInput.value = '';
      taskInput.focus();
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
