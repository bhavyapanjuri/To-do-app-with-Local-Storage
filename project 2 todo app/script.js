// Get elements
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const priorityInput = document.getElementById('priorityInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearBtn = document.getElementById('clearBtn');
const deleteOverdueBtn = document.getElementById('deleteOverdueBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const completedTasksEl = document.getElementById('completedTasks');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Add task
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        dueDate: dueDateInput.value || null,
        priority: priorityInput.value
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    dueDateInput.value = '';
    priorityInput.value = 'medium';
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Toggle task completion
function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newText = prompt('Edit task:', task.text);
    if (newText && newText.trim() !== '') {
        const newDueDate = prompt('Edit due date (YYYY-MM-DD):', task.dueDate || '');
        const newPriority = prompt('Edit priority (high/medium/low):', task.priority);
        
        tasks = tasks.map(t => 
            t.id === id ? { 
                ...t, 
                text: newText.trim(),
                dueDate: newDueDate || null,
                priority: ['high', 'medium', 'low'].includes(newPriority) ? newPriority : t.priority
            } : t
        );
        saveTasks();
        renderTasks();
    }
}

// Clear completed tasks
clearBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

// Delete overdue tasks
deleteOverdueBtn.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    tasks = tasks.filter(task => !task.dueDate || task.dueDate >= today || task.completed);
    saveTasks();
    renderTasks();
});

// Filter tasks
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Render tasks
function renderTasks() {
    let filteredTasks = tasks;

    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    // Sort by priority and due date
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    filteredTasks.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
    });

    taskList.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];

    filteredTasks.forEach(task => {
        const isOverdue = task.dueDate && task.dueDate < today && !task.completed;
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
        
        const dueDateText = task.dueDate ? 
            `<span class="due-date ${isOverdue ? 'overdue-text' : ''}"><i class="fas fa-calendar-alt"></i> ${task.dueDate}${isOverdue ? ' (Overdue)' : ''}</span>` : '';
        
        const priorityIcons = {
            high: '<i class="fas fa-exclamation-circle"></i>',
            medium: '<i class="fas fa-minus-circle"></i>',
            low: '<i class="fas fa-check-circle"></i>'
        };
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-info">
                <span class="task-text">${task.text}</span>
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority}">${priorityIcons[task.priority]} ${task.priority}</span>
                    ${dueDateText}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;

        li.querySelector('.task-checkbox').addEventListener('click', () => toggleTask(task.id));
        li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        taskList.appendChild(li);
    });

    updateTaskCount();
}

// Update task count
function updateTaskCount() {
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    taskCount.textContent = `${pendingTasks} pending task${pendingTasks !== 1 ? 's' : ''}`;
    totalTasksEl.textContent = tasks.length;
    pendingTasksEl.textContent = pendingTasks;
    completedTasksEl.textContent = completedTasks;
}

// Save to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initial render
renderTasks();
