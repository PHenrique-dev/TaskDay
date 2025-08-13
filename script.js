// script.js - TaskDay
// Funções principais serão implementadas nas próximas etapas

// --- Autenticação de Usuário ---
// Estrutura pronta para futura integração com backend

// Exibe formulário correto
function showSection(section) {
  document.getElementById('auth-section').classList.add('d-none');
  document.getElementById('dashboard-section').classList.add('d-none');
  if (section === 'auth') {
    document.getElementById('auth-section').classList.remove('d-none');
  } else if (section === 'dashboard') {
    document.getElementById('dashboard-section').classList.remove('d-none');
  }
}

// Usuário logado
let currentUser = null;

// Carrega usuário logado se "manter logado" estiver ativo
window.onload = function() {
  const keepLogged = localStorage.getItem('keepLogged');
  const user = localStorage.getItem('currentUser');
  if (keepLogged && user) {
    currentUser = JSON.parse(user);
    showSection('dashboard');
    loadRoutine();
    loadStats();
  } else {
    showSection('auth');
  }
};

// Cadastro de usuário
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    if (!email || !password) return;
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      alert('Email já cadastrado!');
      return;
    }
    users.push({ email, password, routine: [], points: 0, trophies: [] });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Cadastro realizado com sucesso!');
    document.getElementById('show-login').click();
  });
}

// Login de usuário
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const keepLogged = document.getElementById('keepLogged').checked;
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      alert('Email ou senha inválidos!');
      return;
    }
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (keepLogged) {
      localStorage.setItem('keepLogged', 'true');
    } else {
      localStorage.removeItem('keepLogged');
    }
    showSection('dashboard');
    loadRoutine();
    loadStats();
  });
}

// Alterna entre login/cadastro
const showRegister = document.getElementById('show-register');
if (showRegister) {
  showRegister.onclick = function() {
    document.querySelector('#register-form').parentElement.parentElement.style.display = 'block';
    document.querySelector('#login-form').parentElement.parentElement.style.display = 'none';
  };
}
const showLogin = document.getElementById('show-login');
if (showLogin) {
  showLogin.onclick = function() {
    document.querySelector('#login-form').parentElement.parentElement.style.display = 'block';
    document.querySelector('#register-form').parentElement.parentElement.style.display = 'none';
  };
}
// Inicializa exibição correta
if (showRegister && showLogin) {
  document.querySelector('#register-form').parentElement.parentElement.style.display = 'none';
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.onclick = function() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('keepLogged');
    currentUser = null;
    showSection('auth');
  };
}

// --- Gestão de Rotina Personalizada ---
// Adicionar, editar, excluir e ordenar atividades

function loadRoutine() {
  if (!currentUser) return;
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  let user = users.find(u => u.email === currentUser.email);
  if (!user) return;
  // Ordena atividades pelo horário de início
  user.routine = user.routine.sort((a, b) => a.start.localeCompare(b.start));
  // Renderiza lista de atividades
  const routineList = document.getElementById('routine-list');
  routineList.innerHTML = '';
  if (user.routine.length === 0) {
    routineList.innerHTML = '<p class="text-muted">Nenhuma atividade cadastrada.</p>';
    return;
  }
  user.routine.forEach((act, idx) => {
    const div = document.createElement('div');
    div.className = 'card mb-2';
    div.innerHTML = `
      <div class="card-body d-flex flex-column flex-sm-row align-items-sm-center justify-content-between">
        <div>
          <strong>${act.name}</strong><br>
          <span class="text-secondary">${act.start} - ${act.end}</span>
        </div>
        <div class="mt-2 mt-sm-0">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editActivity(${idx})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteActivity(${idx})">Excluir</button>
        </div>
      </div>
    `;
    routineList.appendChild(div);
  });
}

// Adicionar atividade
const addActivityBtn = document.getElementById('addActivityBtn');
if (addActivityBtn) {
  addActivityBtn.onclick = function() {
    document.getElementById('activityForm').reset();
    document.getElementById('activityModalLabel').innerText = 'Adicionar Atividade';
    document.getElementById('activityModal').setAttribute('data-edit-idx', '');
    let modal = new bootstrap.Modal(document.getElementById('activityModal'));
    modal.show();
  };
}

// Salvar atividade (adicionar ou editar)
const activityForm = document.getElementById('activityForm');
if (activityForm) {
  activityForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('activityName').value.trim();
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    if (!name || !start || !end) return;
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === currentUser.email);
    if (!user) return;
    const editIdx = document.getElementById('activityModal').getAttribute('data-edit-idx');
    if (editIdx === '') {
      // Adiciona nova atividade
      user.routine.push({ name, start, end });
    } else {
      // Edita atividade existente
      user.routine[editIdx] = { name, start, end };
    }
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    loadRoutine();
    let modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
    modal.hide();
  };
}

// Editar atividade
window.editActivity = function(idx) {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  let user = users.find(u => u.email === currentUser.email);
  if (!user) return;
  const act = user.routine[idx];
  document.getElementById('activityName').value = act.name;
  document.getElementById('startTime').value = act.start;
  document.getElementById('endTime').value = act.end;
  document.getElementById('activityModalLabel').innerText = 'Editar Atividade';
  document.getElementById('activityModal').setAttribute('data-edit-idx', idx);
  let modal = new bootstrap.Modal(document.getElementById('activityModal'));
  modal.show();
};

// Excluir atividade
window.deleteActivity = function(idx) {
  if (!confirm('Deseja realmente excluir esta atividade?')) return;
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  let user = users.find(u => u.email === currentUser.email);
  if (!user) return;
  user.routine.splice(idx, 1);
  localStorage.setItem('users', JSON.stringify(users));
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  loadRoutine();
};
