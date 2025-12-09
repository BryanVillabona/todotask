//url de mockapi
const API_URL = 'https://69378216f8dc350aff34682a.mockapi.io/api/v1/tasks';

//elementos a manipular del DOM
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

//FUNCIONES
// 1. Obtener tareas (GET)
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al conectar');
        const tasks = await response.json();
        
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        tasks.forEach(task => {
            renderTask(task);
        });

        updateCounters();
    } catch (error) {
        console.error(error);
        alert('No se pudieron cargar las tareas. Revisa tu conexión.');
    }
}

// 2. Dibujar una tarea en el DOM
function renderTask(task) {
    const li = document.createElement('li');
    li.classList.add('task-item');
    li.dataset.id = task.id;

    const isDone = task.completed;
    
    if (isDone) li.classList.add('completed-item');

    const actionButton = isDone 
        ? `<button class="btn-icon btn-return" onclick="toggleTask('${task.id}', false)" title="Regresar a pendientes">↩</button>`
        : `<button class="btn-icon btn-check" onclick="toggleTask('${task.id}', true)" title="Marcar como hecha">✔</button>`;

    li.innerHTML = `
        <span class="task-content">${task.title}</span>
        <div class="actions">
            ${actionButton}
            <button class="btn-icon btn-delete" onclick="deleteTask('${task.id}')" title="Eliminar">🗑</button>
        </div>
    `;

    if (isDone) {
        completedList.appendChild(li);
    } else {
        pendingList.appendChild(li);
    }
}

// 3. Añadir nueva tarea (POST)
async function addTask() {
    const title = taskInput.value.trim();
    if (!title) return;

    addBtn.textContent = '...';
    addBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, completed: false })
        });

        if (response.ok) {
            const newTask = await response.json();
            renderTask(newTask); 
            taskInput.value = '';
            updateCounters();
        }
    } catch (error) {
        alert('Error al guardar');
    } finally {
        addBtn.innerHTML = '<span>+</span> Añadir';
        addBtn.disabled = false;
    }
}

// 4. Cambiar estado (PUT)
async function toggleTask(id, newStatus) {

    const card = document.querySelector(`li[data-id="${id}"]`);
    if(card) {
        card.style.opacity = '0.5';
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: newStatus })
        });

        if (response.ok) {
            fetchTasks(); 
        }
    } catch (error) {
        alert('Error al actualizar estado');
        if(card) card.style.opacity = '1';
    }
}

// 5. Eliminar tarea (DELETE)
async function deleteTask(id) {
    if(!confirm('¿Eliminar esta tarea definitivamente?')) return;

    const card = document.querySelector(`li[data-id="${id}"]`);
    if(card) card.style.opacity = '0.2';

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            if(card) card.remove();
            updateCounters();
        }
    } catch (error) {
        alert('No se pudo eliminar');
        if(card) card.style.opacity = '1';
    }
}

// 6. Actualizar contadores
function updateCounters() {
    pendingCount.textContent = pendingList.children.length;
    completedCount.textContent = completedList.children.length;
}

//EVENTOS
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') addTask();
});

//Inicializar
document.addEventListener('DOMContentLoaded', fetchTasks);