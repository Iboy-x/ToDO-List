document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
  
    // Load tasks from local storage
    loadTasks();
  
    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(todoInput.value);
      todoInput.value = '';
    });
  
    todoList.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) {
        deleteTask(e.target.parentElement);
      } else if (e.target.tagName === 'LI') {
        toggleTask(e.target);
      }
    });
  
    function addTask(task) {
      if (!task.trim()) return;
  
      const li = document.createElement('li');
      li.textContent = task;
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.classList.add('delete-btn');
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
  
      saveTasks();
    }
  
    function deleteTask(taskItem) {
      taskItem.remove();
      saveTasks();
    }
  
    function toggleTask(taskItem) {
      taskItem.classList.toggle('completed');
      saveTasks();
    }
  
    function saveTasks() {
      const tasks = [];
      todoList.querySelectorAll('li').forEach(taskItem => {
        tasks.push({
          text: taskItem.firstChild.textContent,
          completed: taskItem.classList.contains('completed')
        });
      });
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    function loadTasks() {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.text;
        if (task.completed) {
          li.classList.add('completed');
        }
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
      });
    }
  });
  