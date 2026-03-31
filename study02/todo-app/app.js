// Created: 2026-03-19 21:02:56
const STORAGE_KEY = 'todo-app-data';
const THEME_KEY   = 'todo-app-theme';

const CATEGORIES = {
  work:     { label: '업무', color: 'var(--color-work)' },
  personal: { label: '개인', color: 'var(--color-personal)' },
  study:    { label: '공부', color: 'var(--color-study)' },
};

const state = {
  todos: [],
  currentFilter: 'all',
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((t) => t.id && t.text && t.category)
      : [];
  } catch (e) {
    return [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
  } catch (e) {
    console.warn('저장 실패:', e);
  }
}

function renderTodos() {
  const list = document.getElementById('todo-list');

  const filtered = state.currentFilter === 'all'
    ? state.todos
    : state.todos.filter((t) => t.category === state.currentFilter);

  const sorted = [
    ...filtered.filter((t) => !t.completed),
    ...filtered.filter((t) => t.completed),
  ];

  if (sorted.length === 0) {
    const msg = state.currentFilter === 'all'
      ? '+ 버튼으로 첫 할 일을 추가하세요!'
      : '이 카테고리에 할 일이 없어요.';
    list.innerHTML = `<li class="empty-msg">${msg}</li>`;
    return;
  }

  list.innerHTML = sorted.map((todo) => `
    <li class="todo-card${todo.completed ? ' completed' : ''}" data-id="${todo.id}" data-category="${todo.category}">
      <input type="checkbox" data-id="${todo.id}" ${todo.completed ? 'checked' : ''} aria-label="완료 표시">
      <span class="badge" style="background: ${CATEGORIES[todo.category].color}">${CATEGORIES[todo.category].label}</span>
      <span class="todo-text editable" data-id="${todo.id}">${todo.text}</span>
      <button class="delete-btn" data-id="${todo.id}" aria-label="삭제">✕</button>
    </li>
  `).join('');
}

function renderProgress() {
  const total = state.todos.length;
  const done = state.todos.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const fill = document.getElementById('progress-fill');
  fill.style.width = `${percent}%`;

  const allDone = percent === 100 && total > 0;
  fill.style.background = allDone ? '#22C55E' : 'var(--color-primary)';

  document.getElementById('progress-text').textContent =
    `${done} / ${total} 완료 (${percent}%)${allDone ? ' 🎉 모두 완료!' : ''}`;
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim().slice(0, 100);

  if (!text) {
    input.focus();
    return;
  }

  const todo = {
    id: crypto.randomUUID(),
    text,
    category: document.getElementById('category-select').value,
    completed: false,
    createdAt: Date.now(),
  };

  state.todos.unshift(todo);
  input.value = '';
  saveToStorage();
  renderTodos();
  renderProgress();
}

function toggleTodo(id) {
  const todo = state.todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveToStorage();
  renderTodos();
  renderProgress();
}

function deleteTodo(id) {
  state.todos = state.todos.filter((t) => t.id !== id);
  saveToStorage();
  renderTodos();
  renderProgress();
}

function updateTodo(id, newText) {
  if (!newText) return;
  const todo = state.todos.find((t) => t.id === id);
  if (todo) todo.text = newText.slice(0, 100);
  saveToStorage();
  renderTodos();
}

function editTodo(id) {
  const li = document.querySelector(`#todo-list li[data-id="${id}"]`);
  if (!li) return;

  const textSpan = li.querySelector('.todo-text');
  const original = state.todos.find((t) => t.id === id)?.text;
  if (original === undefined) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = original;
  input.className = 'edit-input';
  input.maxLength = 100;

  textSpan.replaceWith(input);
  input.focus();
  input.select();

  let committed = false;

  function commit() {
    if (committed) return;
    committed = true;
    const newText = input.value.trim();
    if (newText) {
      updateTodo(id, newText);
    } else {
      renderTodos(); // 빈 값이면 원래 텍스트 복원
    }
  }

  function cancel() {
    if (committed) return;
    committed = true;
    renderTodos();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') cancel();
  });

  input.addEventListener('blur', commit);
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}

function exportToJSON() {
  if (state.todos.length === 0) {
    alert('내보낼 할 일이 없습니다.');
    return;
  }
  const data = JSON.stringify(state.todos, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todos_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function setFilter(category) {
  state.currentFilter = category;
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  renderTodos();
}

function init() {
  // 오늘 날짜 표시
  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    });
  }

  // 테마 복원
  if (localStorage.getItem(THEME_KEY) === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('theme-toggle').textContent = '☀️';
  }

  state.todos = loadFromStorage();

  // 추가 버튼
  document.getElementById('add-btn').addEventListener('click', addTodo);

  // 엔터 키
  document.getElementById('todo-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  // 이벤트 위임: toggle / delete / edit
  document.getElementById('todo-list').addEventListener('click', (e) => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (checkbox) { toggleTodo(checkbox.dataset.id); return; }

    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) { deleteTodo(deleteBtn.dataset.id); return; }
  });

  document.getElementById('todo-list').addEventListener('dblclick', (e) => {
    const textSpan = e.target.closest('.editable');
    if (textSpan) editTodo(textSpan.dataset.id);
  });

  // 카테고리 탭
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.category));
  });

  document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
  document.getElementById('export-btn').addEventListener('click', exportToJSON);

  // 완료 항목 삭제
  document.getElementById('clear-completed').addEventListener('click', () => {
    state.todos = state.todos.filter((t) => !t.completed);
    saveToStorage();
    renderTodos();
    renderProgress();
  });

  renderTodos();
  renderProgress();
}

document.addEventListener('DOMContentLoaded', init);
