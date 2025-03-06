document.addEventListener("DOMContentLoaded", () => {
  const taskTitle = document.getElementById("taskTitle");
  const taskDescription = document.getElementById("taskDescription");
  const addTask = document.getElementById("addTask");
  const taskList = document.getElementById("taskList");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const toggleDarkMode = document.getElementById("toggleDarkMode");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let darkMode = localStorage.getItem("darkMode") === "enabled";

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function renderTasks(filter = "all") {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(
      (task) =>
        filter === "all" ||
        (filter === "completed" ? task.completed : !task.completed)
    );

    if (filteredTasks.length === 0) {
      taskList.innerHTML = `<p class="text-gray-500 text-center">No Task Available</p>`;
      return;
    }

    filteredTasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = `flex justify-between items-center p-2 border rounded`;
      li.draggable = true;
      li.dataset.index = index;
      li.innerHTML = `
          <div class="${task.completed ? "line-through" : ""}">
            <strong>${task.title}</strong>
            <p>${task.description}</p>
          </div>
          <div>
            <button onclick="toggleComplete(${index})" class="px-2 py-1 bg-blue-500 text-white rounded">
              ${task.completed ? "Ｘ" : "✓"}
            </button>
            <button onclick="editTask(${index})" class="px-2 py-1 bg-yellow-500 text-white rounded">✏️</button>
            <button onclick="deleteTask(${index})" class="px-2 py-1 bg-red-400 text-white rounded">🗑️</button>
          </div>
        `;

      li.addEventListener("dragstart", handleDragStart);
      li.addEventListener("dragover", handleDragOver);
      li.addEventListener("drop", handleDrop);
      li.addEventListener("dragend", handleDragEnd);
      taskList.appendChild(li);
    });
  }

  function addNewTask() {
    if (taskTitle.value.trim() === "") return;
    tasks.push({
      title: taskTitle.value,
      description: taskDescription.value,
      completed: false,
    });
    saveTasks();
    renderTasks();
    taskTitle.value = "";
    taskDescription.value = "";
  }

  function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  }

  function editTask(index) {
    const newTitle = prompt("Edit Title:", tasks[index].title);
    const newDesc = prompt("Edit Description:", tasks[index].description);
    if (newTitle !== null) tasks[index].title = newTitle;
    if (newDesc !== null) tasks[index].description = newDesc;
    saveTasks();
    renderTasks();
  }

  function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }

  function toggleDarkModeHandler() {
    darkMode = !darkMode;
    localStorage.setItem("darkMode", darkMode ? "enabled" : "disabled");

    if (darkMode) {
      document.body.classList.add("dark:bg-gray-900", "dark:text-white");
    } else {
      document.body.classList.remove("dark:bg-gray-900", "dark:text-white");
    }
  }

  // Drag and Drop Functions
  let draggedItem = null;
  let draggedIndex = null;

  function handleDragStart(event) {
    draggedItem = event.target;
    draggedIndex = parseInt(draggedItem.dataset.index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", draggedItem.innerHTML);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event) {
    event.preventDefault();

    const targetItem = event.target.closest("li");
    if (!targetItem || targetItem === draggedItem) return;

    const targetIndex = parseInt(targetItem.dataset.index);

    // Swap position
    const draggedTask = tasks[draggedIndex];
    tasks.splice(draggedIndex, 1);
    tasks.splice(targetIndex, 0, draggedTask);

    saveTasks();
    renderTasks();
  }

  function handleDragEnd() {
    draggedItem = null;
    draggedIndex = null;
  }

  // Event Listeners
  addTask.addEventListener("click", addNewTask);
  toggleDarkMode.addEventListener("click", toggleDarkModeHandler);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      renderTasks(button.dataset.filter);
    });
  });

  // Render tasks on load
  renderTasks();

  // Expose functions to global scope
  window.toggleComplete = toggleComplete;
  window.editTask = editTask;
  window.deleteTask = deleteTask;
});
