document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const categoryDropdown = document.createElement("select");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const timerModal = document.getElementById("timer-modal");
  const timerInput = document.getElementById("timer-input");
  const setTimerBtn = document.getElementById("set-timer-btn");
  const totalFocusTime = document.getElementById("total-focus-time");
  const categoryChart = document.getElementById("categoryChart");

  let timerQueue = [];
  let isTimerRunning = false;
  let activeTaskId = null;
  let focusData = JSON.parse(localStorage.getItem("focusData")) || {};

  // adding categories
  const categories = ["Math", "Science", "English", "Break"];
  categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryDropdown.appendChild(option);
  });

  taskInput.insertAdjacentElement("afterend", categoryDropdown);

  // Adding a new task
  addTaskBtn.addEventListener("click", () => {
      const taskText = taskInput.value.trim();
      const category = categoryDropdown.value;

      if (taskText === "") return;

      const taskId = `task-${Date.now()}`;
      const taskItem = document.createElement("li");
      taskItem.className = "task";
      taskItem.innerHTML = `
          <span>${taskText} (${category})</span>
          <button class="delete-btn">Delete</button>
          <button class="timer-btn">Set Timer</button>
          <span class="timer" id="${taskId}">00:00:00</span>
      `;

      taskList.appendChild(taskItem);
      taskInput.value = "";

      attachEventListeners(taskItem, taskId, category);
  });

  function attachEventListeners(taskItem, taskId, category) {
      taskItem.querySelector(".delete-btn").addEventListener("click", () => {
          if (taskId === activeTaskId) {
              alert("You cannot delete a task while its timer is running.");
              return;
          }
          taskItem.remove();
          timerQueue = timerQueue.filter(task => task.id !== taskId);
      });

      taskItem.querySelector(".timer-btn").addEventListener("click", () => {
          timerModal.style.display = "block";
          timerModal.dataset.currentTaskId = taskId;
          timerModal.dataset.currentCategory = category;
      });
  }

  setTimerBtn.addEventListener("click", () => {
      const duration = parseInt(timerInput.value.trim(), 10);
      if (isNaN(duration) || duration <= 0) {
          alert("Please enter a valid time in minutes.");
          return;
      }

      const taskId = timerModal.dataset.currentTaskId;
      const category = timerModal.dataset.currentCategory;
      timerQueue.push({ id: taskId, duration: duration * 60, category });
      timerModal.style.display = "none";
      timerInput.value = "";

      if (!isTimerRunning) {
          runNextTimer();
      }
  });

  function runNextTimer() {
      if (timerQueue.length === 0) {
          isTimerRunning = false;
          activeTaskId = null;
          return;
      }

      isTimerRunning = true;
      const currentTask = timerQueue.shift();
      activeTaskId = currentTask.id;
      const taskTimer = document.getElementById(currentTask.id);
      let timeRemaining = currentTask.duration;

      const interval = setInterval(() => {
          const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
          const seconds = String(timeRemaining % 60).padStart(2, "0");
          taskTimer.textContent = `${minutes}:${seconds}`;

          if (timeRemaining === 0) {
              clearInterval(interval);
              taskTimer.textContent = "Done!";
              addFocusTime(currentTask.category, currentTask.duration);
              activeTaskId = null;
              isTimerRunning = false;
              runNextTimer();
          }

          timeRemaining--;
      }, 1000);
  }

  function addFocusTime(category, duration) {
      focusData[category] = (focusData[category] || 0) + duration;
      localStorage.setItem("focusData", JSON.stringify(focusData));
      updateDashboard();
  }

  function updateDashboard() {
      const totalMinutes = Object.values(focusData).reduce((sum, time) => sum + time, 0);
      const hours = Math.floor(totalMinutes / 3600);
      const minutes = Math.floor((totalMinutes % 3600) / 60);

      totalFocusTime.textContent = `${hours}h ${minutes}m`;

      const chartData = {
          labels: Object.keys(focusData),
          datasets: [{
              label: "Time Spent (minutes)",
              data: Object.values(focusData).map(time => Math.floor(time / 60)),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          }]
      };

      const chartConfig = {
          type: "bar",
          data: chartData,
          options: {
              responsive: true,
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      };

      new Chart(categoryChart, chartConfig);
  }

  updateDashboard();
});

