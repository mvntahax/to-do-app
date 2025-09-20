// ---------- DOM ELEMENT REFERENCES ----------
const taskInput = document.getElementById('taskInput');  // Task text input field
const timeInput = document.getElementById('timeInput');  // Task due-date/time input
const taskList = document.getElementById('taskList');    // UL container for tasks
const emptyMessage = document.getElementById('emptyMessage'); // Message shown when no tasks exist

// ---------- STATE VARIABLES ----------
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];            // Active tasks (persisted)
let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || []; // Soft-deleted tasks (persisted)
let currentFilter = 'all';    // Tracks current filter (all, completed, pending, deleted)
let activeEditIndex = null;   // Keeps track of which task is being edited
let descendingOrder = false;  // Sort order flag
let activeTheme;              // Holds current theme object

// ---------- INITIALIZATION ----------
const savedTheme = localStorage.getItem('theme') || 'light'; // Load last used theme or default
setTheme(savedTheme);  // Apply theme
renderTasks();         // Render initial task list

// ---------- CORE FUNCTION: ADD TASK ----------
function addTask() {
  const text = taskInput.value.trim();
  const time = timeInput.value;
  if (!text) return;  // Prevent adding empty tasks

  // Add new task object to the beginning of array
  tasks.unshift({ text, time, completed: false });
  saveTasks();
  renderTasks();

  // Clear inputs after adding
  taskInput.value = '';
  timeInput.value = '';
}

// Allow pressing Enter in either input to add a task
[taskInput, timeInput].forEach(input => {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
  });
});

// ---------- RENDER TASKS ON SCREEN ----------
function renderTasks() {
  taskList.innerHTML = ''; // Clear existing tasks

  // Choose list: active tasks or deleted tasks
  const listToRender = currentFilter === 'deleted' ? deletedTasks : tasks;

  // Filter tasks based on current filter selection
  const filteredTasks = listToRender.filter(task => {
    if (currentFilter === 'completed') return task.completed;
    if (currentFilter === 'pending') return !task.completed;
    return true; // 'all' or 'deleted'
  });

  // Show message if no tasks match filter
  emptyMessage.innerHTML = filteredTasks.length === 0 ? 'ops no tasks found!' : '';

  // Apply sort order (reverse for descending)
  const orderedTasks = descendingOrder ? filteredTasks.slice().reverse() : filteredTasks;

  // Render each task as <li>
  orderedTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.style.backgroundColor = activeTheme.secondary;
    li.style.color = activeTheme.text;
    li.className = `flex items-center justify-between p-2 rounded-lg ${task.completed ? 'bg-green-700' : 'bg-gray-700'}`;

    // Dynamic HTML: checkboxes, text inputs, buttons depending on filter
    li.innerHTML = `
      <div class="flex items-center gap-2 flex-wrap">
        ${currentFilter !== 'deleted' ? `<input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${index})" class="form-checkbox h-5 w-5">` : ''}
        <input type="text" value="${task.text}" ${task.completed || currentFilter === 'deleted' ? 'readonly' : ''} class="flex-1 bg-transparent outline-none ${task.completed ? 'line-through' : ''}">
        <input type="datetime-local" value="${task.time}" readonly class="bg-transparent outline-none text-sm text-gray-400 date-input">
      </div>
      <div class="flex gap-2">
        ${currentFilter !== 'deleted' ? `
          <button onclick="editTask(this, ${index})" ${task.completed ? 'disabled' : ''} class="text-xl text-blue-600 hover:text-blue-700"><i class="bi bi-pencil"></i></button>
          <button onclick="softDeleteTask(${index})" class="text-xl text-red-600 hover:text-red-700"><i class="bi bi-x-lg"></i></button>
        ` : `
          <button onclick="restoreTask(${index})" class="text-xl text-green-600 hover:text-green-700"><i class="bi bi-arrow-counterclockwise"></i></button>
          <button onclick="permanentlyDeleteTask(${index})" class="text-xl text-red-600 hover:text-red-700"><i class="bi bi-trash"></i></button>
        `}
      </div>
    `;
    taskList.appendChild(li);
  });

  highlightActiveEdit();
}

// ---------- TASK ACTIONS ----------
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function editTask(button, index) {
  const li = button.closest('li');
  const textInput = li.querySelector('input[type="text"]');
  const dateInput = li.querySelector('input[type="datetime-local"]');

  if (activeEditIndex === index) {
    // Save edited task
    textInput.setAttribute('readonly', true);
    dateInput.setAttribute('readonly', true);
    tasks[index].text = textInput.value.trim();
    tasks[index].time = dateInput.value;
    button.innerHTML = '<i class="bi bi-pencil"></i>';
    activeEditIndex = null;
    saveTasks();
  } else {
    // If another task is already being edited, reset it first
    if (activeEditIndex !== null) {
      const previousLi = taskList.children[activeEditIndex];
      const previousTextInput = previousLi.querySelector('input[type="text"]');
      const previousDateInput = previousLi.querySelector('input[type="datetime-local"]');
      const previousButton = previousLi.querySelector('button');
      previousTextInput.setAttribute('readonly', true);
      previousDateInput.setAttribute('readonly', true);
      previousButton.innerHTML = '<i class="bi bi-pencil"></i>';
    }

    // Enable editing for selected task
    textInput.removeAttribute('readonly');
    dateInput.removeAttribute('readonly');
    textInput.focus();
    button.innerHTML = '<i class="bi bi-check2"></i>';
    activeEditIndex = index;
  }

  highlightActiveEdit();
}

function highlightActiveEdit() {
  // Visually highlight task currently being edited
  Array.from(taskList.children).forEach((li, idx) => {
    li.style.border = idx === activeEditIndex ? `1px solid ${activeTheme.active}` : 'none';
  });
}

// ---------- SOFT DELETE, RESTORE & PERMANENT DELETE ----------
function softDeleteTask(index) {
  const removedTask = tasks.splice(index, 1)[0];
  deletedTasks.push(removedTask);
  saveTasks();
  saveDeletedTasks();
  renderTasks();
}

function restoreTask(index) {
  const restoredTask = deletedTasks.splice(index, 1)[0];
  tasks.push(restoredTask);
  saveTasks();
  saveDeletedTasks();
  renderTasks();
}

function permanentlyDeleteTask(index) {
  deletedTasks.splice(index, 1);
  saveDeletedTasks();
  renderTasks();
}

// ---------- BULK DELETE ----------
function deleteALLTasks() {
  if (confirm("are you sure you want to delete all tasks and deleted tasks?")) {
    tasks.length = 0;
    deletedTasks.length = 0;
    saveTasks();
    saveDeletedTasks();
    renderTasks();
  }
}

// ---------- SAVE TO LOCALSTORAGE ----------
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveDeletedTasks() {
  localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
}

// ---------- ORDER & FILTER ----------
function setOrder(order) {
  descendingOrder = (order === 'desc');
  renderTasks();
}

function filterTasks(filter) {
  currentFilter = filter;
  renderTasks();

  // Update sidebar button active state
  const allButtons = document.querySelectorAll('.sidebar-btn');
  allButtons.forEach(btn => {
    btn.style.backgroundColor = activeTheme.button;
    btn.style.color = activeTheme.text;
  });

  const buttonMap = { all: 0, completed: 1, pending: 2, deleted: 3 };
  const activeBtn = allButtons[buttonMap[filter]];
  if (activeBtn) {
    activeBtn.style.backgroundColor = activeTheme.active;
    activeBtn.style.color = activeTheme.activeText;
  }
}

// ---------- THEME HANDLING ----------
function setTheme(theme) {
  // Define theme colors
  const themes = {
    light: { bg: '#FFFFFF', text: '#1F2937', secondary: '#F3F4F6', button: '#E5E7EB', active: '#000000', activeText: '#FFFFFF' },
    dark: { bg: '#000000', text: '#FFFFFF', secondary: '#121212', button: '#1E1E1E', active: '#FFFFFF', activeText: '#000000' },
    space: { bg: '#0B0B23', text: '#A7A7FF', secondary: '#1A1A3A', button: '#2C2C5E', active: '#A7A7FF', activeText: '#0B0B23' },
    coffee: { bg: '#F5ECE4', text: '#3B2F2F', secondary: '#EDE0D4', button: '#E2D3C0', active: '#4B3A2A', activeText: '#FFFFFF' },
    sunset: { bg: '#FFF3E6', text: '#CC3300', secondary: '#FFDAB9', button: '#FFD0A8', active: '#CC3300', activeText: '#FFFFFF' },
    midnight: { bg: '#0A0A1A', text: '#D1D1E9', secondary: '#1A1A2E', button: '#141424', active: '#D1D1E9', activeText: '#0A0A1A' }
  };

  activeTheme = themes[theme];
  localStorage.setItem('theme', theme);

  // Apply colors to UI
  document.body.style.backgroundColor = activeTheme.bg;
  document.body.style.color = activeTheme.text;

  document.querySelectorAll('aside, #modal').forEach(el => {
    el.style.backgroundColor = activeTheme.secondary;
    el.style.color = activeTheme.text;
  });

  document.querySelectorAll('button').forEach(button => {
    button.style.backgroundColor = activeTheme.button;
    button.style.color = activeTheme.text;
  });

  document.querySelectorAll('input[type="text"], input[type="datetime-local"]').forEach(input => {
    input.style.backgroundColor = activeTheme.button;
    input.style.color = activeTheme.text;
  });

  // Adjust navbar border color based on theme text color
  const navBottom = document.querySelector('nav');
  if (navBottom && activeTheme.text) {
    const color = activeTheme.text.slice(1);
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    navBottom.style.borderBottom = `1px solid rgba(${r}, ${g}, ${b}, 0.2)`;
  }

  renderTasks();
  filterTasks(currentFilter);
}

// ---------- THEME MODAL ----------
function closeThemeModal() {
  document.getElementById('themeModal').classList.add('hidden');
}

function selectTheme(theme) {
  setTheme(theme);
  closeThemeModal();
}