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
    updateNavbarOnLogin(currentUser);
    loadRoutine();
    loadStats();
    updateWelcome(currentUser);
  } else {
    showSection('auth');
    updateNavbarOnLogout();
  }
};

// Cadastro de usuário
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    if (!name || !email || !password) return;
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      alert('Email já cadastrado!');
      return;
    }
    users.push({ name, email, password, routine: [], points: 0, trophies: [] });
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
    updateNavbarOnLogin(user);
    loadRoutine();
    loadStats();
    updateWelcome(user);
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
const logoutBtn = document.getElementById('navLogout');
if (logoutBtn) {
  logoutBtn.onclick = function() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('keepLogged');
    currentUser = null;
    showSection('auth');
    updateNavbarOnLogout();
  };
}

// Exibe/oculta links da navbar conforme login
function updateNavbarOnLogin(user) {
  document.getElementById('navLogin').classList.add('d-none');
  document.getElementById('navRegister').classList.add('d-none');
  document.getElementById('navWelcome').classList.remove('d-none');
  document.getElementById('navActivities').classList.remove('d-none');
  document.getElementById('navProfile').classList.remove('d-none');
  document.getElementById('navAchievements').classList.remove('d-none');
  document.getElementById('navLogout').classList.remove('d-none');
  document.getElementById('userNameNav').innerText = user.name || user.email;
  // Saudação no dashboard (opcional)
  const dashboard = document.getElementById('dashboard-section');
  if (dashboard) {
    let welcomeEl = dashboard.querySelector('.dashboard-welcome');
    if (!welcomeEl) {
      welcomeEl = document.createElement('div');
      welcomeEl.className = 'dashboard-welcome text-center mb-3';
      dashboard.insertBefore(welcomeEl, dashboard.firstChild);
    }
    welcomeEl.innerHTML = `<h4>Bem-vindo(a), ${user.name || user.email}!</h4>`;
  }
}
function updateNavbarOnLogout() {
  document.getElementById('navLogin').classList.remove('d-none');
  document.getElementById('navRegister').classList.remove('d-none');
  document.getElementById('navWelcome').classList.add('d-none');
  document.getElementById('navActivities').classList.add('d-none');
  document.getElementById('navProfile').classList.add('d-none');
  document.getElementById('navAchievements').classList.add('d-none');
  document.getElementById('navLogout').classList.add('d-none');
}

// --- Gestão de Rotina Personalizada ---
// Adicionar, editar, excluir e ordenar atividades

// Função para obter o dia da semana atual (0=Dom, 1=Seg, ...)
function getTodayWeekday() {
  return new Date().getDay();
}

// Atualiza rotina para mostrar apenas atividades do dia atual
function loadRoutine() {
  if (!currentUser) return;
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  let user = users.find(u => u.email === currentUser.email);
  if (!user) return;
  user.routine = user.routine.sort((a, b) => a.start.localeCompare(b.start));
  const routineList = document.getElementById('routine-list');
  routineList.innerHTML = '';
  const today = getTodayWeekday();
  // Filtra atividades do dia
  const todayActivities = user.routine.filter(act => act.days && act.days.includes(today));
  if (todayActivities.length === 0) {
    routineList.innerHTML = '<p class="text-muted">Nenhuma atividade para hoje.</p>';
    return;
  }
  todayActivities.forEach((act, idx) => {
    const div = document.createElement('div');
    div.className = 'card mb-2 position-relative';
    let badgeConcluida = act.completed ? `<span class='badge bg-success position-absolute top-0 end-0 m-2' style='z-index:2;'>Concluída</span>` : '';
    div.innerHTML = `
      ${badgeConcluida}
      <div class="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
        <div class="flex-grow-1">
          <strong>${act.name}</strong><br>
          <span class="text-secondary">${act.start} - ${act.end}</span>
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-center justify-content-end">
          <button class="btn btn-sm btn-outline-primary" onclick="editActivity(${idx})"><i class="bi bi-pencil"></i> Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="showDeleteModal(${idx})"><i class="bi bi-trash"></i> Excluir</button>
          <button class="btn btn-sm btn-outline-info" onclick="addEventToGoogleCalendar(currentUser.routine[${idx}])"><i class="bi bi-calendar-plus"></i> Google Calendar</button>
          ${!act.completed ? `<button class='btn btn-sm btn-success ms-2' onclick='completeActivity(${idx})'>Concluir</button>` : ''}
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

// Função para obter dias selecionados
function getSelectedDays() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    if (document.getElementById('day' + i)?.checked) days.push(i);
  }
  return days;
}

// Salvar atividade (adicionar ou editar)
const activityForm = document.getElementById('activityForm');
if (activityForm) {
  activityForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('activityName').value.trim();
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    const days = getSelectedDays();
    if (!name || !start || !end) return;
    if (days.length === 0) {
      alert('Selecione pelo menos um dia da semana para a atividade.');
      return;
    }
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === currentUser.email);
    if (!user) return;
    const editIdx = document.getElementById('activityModal').getAttribute('data-edit-idx');
    if (editIdx === '') {
      // Adiciona nova atividade
      user.routine.push({ name, start, end, days });
    } else {
      // Edita atividade existente
      user.routine[editIdx] = { name, start, end, days };
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
  // Preenche os checkboxes dos dias
  if (act.days) {
    for (let i = 0; i < 7; i++) {
      document.getElementById('day' + i).checked = act.days.includes(i);
    }
  }
  document.getElementById('activityModalLabel').innerText = 'Editar Atividade';
  document.getElementById('activityModal').setAttribute('data-edit-idx', idx);
  let modal = new bootstrap.Modal(document.getElementById('activityModal'));
  modal.show();
};

// Modal de confirmação de exclusão
function showDeleteModal(idx) {
  let modalDiv = document.getElementById('deleteModal');
  if (!modalDiv) {
    modalDiv = document.createElement('div');
    modalDiv.id = 'deleteModal';
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = -1;
    modalDiv.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background:#23272b; color:#2ecc71;">
          <div class="modal-header" style="background:#181a1b; color:#2ecc71;">
            <h5 class="modal-title">Confirmar exclusão</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" style="filter:invert(60%) sepia(100%) saturate(500%) hue-rotate(90deg);"></button>
          </div>
          <div class="modal-body text-center">
            <div class="mb-3"><i class="bi bi-exclamation-triangle" style="font-size:2.5rem;color:#2ecc71;"></i></div>
            <div>Tem certeza que deseja excluir esta atividade?</div>
          </div>
          <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-outline-success" id="confirmDeleteBtn">Confirmar</button>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }
  let modal = new bootstrap.Modal(modalDiv);
  modal.show();
  document.getElementById('confirmDeleteBtn').onclick = function() {
    modal.hide();
    deleteActivityConfirmed(idx);
  };
}

// Função chamada após confirmação
function deleteActivityConfirmed(idx) {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  let user = users.find(u => u.email === currentUser.email);
  if (!user) return;
  user.routine.splice(idx, 1);
  localStorage.setItem('users', JSON.stringify(users));
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  loadRoutine();
}

// --- Gamificação: Pontos, Níveis, Conquistas, Estatísticas ---

function completeActivity(idx) {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  let user = users.find(u => u.email === currentUser.email);
  if (!user) return;
  const act = user.routine[idx];
  const now = new Date();
  const today = now.toISOString().slice(0,10);
  // Marca como concluída e verifica pontualidade
  if (!act.completed) {
    act.completed = today;
    // Pontualidade: dentro do horário de término
    const end = new Date(now.toISOString().slice(0,10) + 'T' + act.end);
    let points = 0;
    let msg = '';
    if (now <= end) {
      user.points += 10;
      points = 10;
      msg = 'Você concluiu sua atividade no horário!<br><strong>+10 pontos</strong><br>Continue assim, disciplina é a chave do sucesso!';
      checkTrophies(user);
    } else {
      user.points += 5;
      points = 5;
      msg = 'Atividade concluída!<br><strong>+5 pontos</strong><br>Lembre-se: o importante é não desistir!';
    }
    showCongratsModal(msg);
  }
  localStorage.setItem('users', JSON.stringify(users));
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  loadRoutine();
  loadStats();
}

function checkTrophies(user) {
  // Troféus simples: 100 pontos, 10 atividades concluídas, 7 dias seguidos
  if (user.points >= 100 && !user.trophies.includes('100 pontos')) {
    user.trophies.push('100 pontos');
    showToast('Troféu desbloqueado: 100 pontos!');
  }
  const completedCount = user.routine.filter(a => a.completed).length;
  if (completedCount >= 10 && !user.trophies.includes('10 atividades')) {
    user.trophies.push('10 atividades');
    showToast('Troféu desbloqueado: 10 atividades concluídas!');
  }
  // 7 dias seguidos
  let days = {};
  user.routine.forEach(a => { if (a.completed) days[a.completed]=true; });
  if (Object.keys(days).length >= 7 && !user.trophies.includes('7 dias seguidos')) {
    user.trophies.push('7 dias seguidos');
    showToast('Troféu desbloqueado: 7 dias seguidos!');
  }
}

function getLevel(points) {
  if (points < 50) return 1;
  if (points < 150) return 2;
  if (points < 300) return 3;
  return 4;
}

function loadStats() {
  if (!currentUser) return;
  const statsDiv = document.getElementById('stats');
  const points = currentUser.points || 0;
  const level = getLevel(points);
  const completed = (currentUser.routine||[]).filter(a => a.completed).length;
  const total = (currentUser.routine||[]).length;
  // Estatísticas semanais/mensais
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let weekCount = 0, monthCount = 0;
  (currentUser.routine||[]).forEach(a => {
    if (a.completed) {
      const d = new Date(a.completed);
      if (d >= weekStart) weekCount++;
      if (d >= monthStart) monthCount++;
    }
  });
  statsDiv.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>Pontos:</strong> ${points}<br>
            <strong>Nível:</strong> ${level}<br>
            <strong>Atividades concluídas:</strong> ${completed}/${total}
          </div>
          <div>
            <strong>Conquistas:</strong><br>
            ${currentUser.trophies && currentUser.trophies.length ? currentUser.trophies.map(t=>`<span class='badge bg-success me-1'>${t}</span>`).join('') : '<span class="text-white">Nenhuma</span>'}
          </div>
        </div>
        <hr>
        <div>
          <strong>Semana:</strong> ${weekCount} atividades<br>
          <strong>Mês:</strong> ${monthCount} atividades
        </div>
        <div class="mt-2 text-center">
          <span id="motivationalMsg"></span>
        </div>
      </div>
    </div>
  `;
  showMotivationalMsg(level, completed, total);
}

function showMotivationalMsg(level, completed, total) {
  const msgEl = document.getElementById('motivationalMsg');
  let msg = '';
  if (completed === total && total > 0) msg = 'Rotina concluída! Você é incrível!';
  else if (level === 1) msg = 'Comece pequeno, mas não pare!';
  else if (level === 2) msg = 'Ótimo progresso! Continue assim!';
  else if (level === 3) msg = 'Você está dominando sua rotina!';
  else if (level === 4) msg = 'Exemplo de disciplina! Parabéns!';
  msgEl.innerText = msg;
}

// --- Tema Claro/Escuro ---

// Toasts centralizados no container
function showToast(msg) {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-white bg-primary border-0 mb-2';
  toast.role = 'alert';
  toast.innerHTML = `<div class=\"d-flex\"><div class=\"toast-body\">${msg}</div><button type=\"button\" class=\"btn-close btn-close-white me-2 m-auto\" data-bs-dismiss=\"toast\"></button></div>`;
  toastContainer.appendChild(toast);
  let bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Adiciona botão de concluir atividade na rotina

// --- Integração Google Calendar e Notificações ---

// Adiciona botão de sincronizar Google Calendar no dashboard
(function addGoogleCalendarBtn() {
  const dashboard = document.getElementById('dashboard-section');
  if (dashboard && !document.getElementById('googleSyncBtn')) {
    const btn = document.createElement('button');
    btn.id = 'googleSyncBtn';
    btn.className = 'btn btn-outline-info w-100 mb-3';
    btn.innerText = 'Sincronizar com Google Calendar';
    btn.onclick = function() { googleAuth(); };
    dashboard.insertBefore(btn, dashboard.firstChild);
  }
})();

// Estrutura OAuth2 Google (front-end)
function googleAuth() {
  showToast('Funcionalidade de autenticação Google em desenvolvimento.');
  // Aqui será implementado o fluxo OAuth2
  // window.open('https://accounts.google.com/o/oauth2/v2/auth?...', '_blank');
}

// Adicionar evento ao Google Calendar
function addEventToGoogleCalendar(activity) {
  showToast('Adicionar evento ao Google Calendar em desenvolvimento.');
  // Aqui será implementada a chamada à API do Google Calendar
}

// Adiciona botão de adicionar evento em cada atividade

// Notificações no navegador para início de atividade
function scheduleNotifications() {
  if (!currentUser || !currentUser.routine) return;
  if (!('Notification' in window)) return;
  currentUser.routine.forEach((act, idx) => {
    if (act.completed) return;
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    const start = new Date(today + 'T' + act.start);
    const diff = start - now;
    if (diff > 0 && diff < 3600000) { // até 1h antes
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('TaskDay', { body: `Está quase na hora de: ${act.name}` });
        }
      }, diff);
    }
  });
}

// Solicita permissão de notificação ao logar
(function askNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
})();

// Agenda notificações ao carregar rotina
(function autoScheduleNotifications() {
  const origLoadRoutine = window.loadRoutine;
  window.loadRoutine = function() {
    origLoadRoutine();
    scheduleNotifications();
  };
})();

// Renderiza tela de perfil
function showProfile() {
  if (!currentUser) return;
  const card = document.getElementById('profileCard');
  const points = currentUser.points || 0;
  const level = getLevel(points);
  const completed = (currentUser.routine||[]).filter(a => a.completed).length;
  const total = (currentUser.routine||[]).length;
  card.innerHTML = `
    <div class="card profile-card mx-auto mb-4" style="max-width:400px;">
      <div class="card-body text-center">
        <div class="mb-3">
          <i class="bi bi-person-circle" style="font-size:2.5rem;color:#007bff;"></i>
        </div>
        <h5 class="card-title mb-1">${currentUser.name}</h5>
        <p class="text-white mb-2">${currentUser.email}</p>
        <div class="mb-2">
          <span class="badge bg-primary">Nível ${level}</span>
          <span class="badge bg-success">${points} pontos</span>
        </div>
        <div class="mb-2">
          <strong>Atividades concluídas:</strong> ${completed} / ${total}
        </div>
        <div class="mb-2">
          <strong>Conquistas:</strong> ${currentUser.trophies && currentUser.trophies.length ? currentUser.trophies.map(t=>`<span class='badge bg-warning text-white me-1'>${t}</span>`).join('') : '<span class="text-white">Nenhuma</span>'}
        </div>
      </div>
    </div>
  `;
}

// Carrega tela dinâmica no dashboard
function loadScreenHtml(file, containerId, callback) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(containerId).innerHTML = html;
      if (callback) callback();
    });
}

// Navegação entre telas usando arquivos separados
function showScreen(screen) {
  document.getElementById('screenActivities').classList.add('d-none');
  document.getElementById('screenProfile').classList.add('d-none');
  document.getElementById('screenAchievements').classList.add('d-none');
  if (screen === 'activities') {
    document.getElementById('screenActivities').classList.remove('d-none');
    loadScreenHtml('atividades.html', 'screenActivities', () => {
      loadRoutine();
      loadStats();
      setupActivityListeners();
    });
  } else if (screen === 'profile') {
    document.getElementById('screenProfile').classList.remove('d-none');
    loadScreenHtml('perfil.html', 'screenProfile', showProfile);
  } else if (screen === 'achievements') {
    document.getElementById('screenAchievements').classList.remove('d-none');
    loadScreenHtml('conquistas.html', 'screenAchievements', showAchievements);
  }
}

// Eventos de navegação
const navActivities = document.getElementById('navActivities');
if (navActivities) navActivities.onclick = () => showScreen('activities');
const navProfile = document.getElementById('navProfile');
if (navProfile) navProfile.onclick = () => showScreen('profile');
const navAchievements = document.getElementById('navAchievements');
if (navAchievements) navAchievements.onclick = () => showScreen('achievements');

// Exibe tela de atividades por padrão após login
function updateNavbarOnLogin(user) {
  document.getElementById('navLogin').classList.add('d-none');
  document.getElementById('navRegister').classList.add('d-none');
  document.getElementById('navWelcome').classList.remove('d-none');
  document.getElementById('navActivities').classList.remove('d-none');
  document.getElementById('navProfile').classList.remove('d-none');
  document.getElementById('navAchievements').classList.remove('d-none');
  document.getElementById('navLogout').classList.remove('d-none');
  document.getElementById('userNameNav').innerText = user.name || user.email;
  // Saudação no dashboard (opcional)
  const dashboard = document.getElementById('dashboard-section');
  if (dashboard) {
    let welcomeEl = dashboard.querySelector('.dashboard-welcome');
    if (!welcomeEl) {
      welcomeEl = document.createElement('div');
      welcomeEl.className = 'dashboard-welcome text-center mb-3';
      dashboard.insertBefore(welcomeEl, dashboard.firstChild);
    }
    welcomeEl.innerHTML = `<h4>Bem-vindo(a), ${user.name || user.email}!</h4>`;
  }
  showScreen('activities');
  updateWelcome(user);
}

// Lista de conquistas possíveis
const ALL_ACHIEVEMENTS = [
  { key: '100 pontos', label: '100 pontos', icon: 'bi-star-fill' },
  { key: '10 atividades', label: '10 atividades concluídas', icon: 'bi-check2-circle' },
  { key: '7 dias seguidos', label: '7 dias seguidos', icon: 'bi-calendar-week' }
];
// Renderiza tela de conquistas
function showAchievements() {
  if (!currentUser) return;
  const list = document.getElementById('achievementsList');
  const unlocked = currentUser.trophies || [];
  list.innerHTML = '<div class="row">' + ALL_ACHIEVEMENTS.map(a => {
    const isUnlocked = unlocked.includes(a.key);
    return `
      <div class="col-12 col-md-6 mb-3">
        <div class="card achievement-card ${isUnlocked ? 'border-success' : 'border-secondary'}">
          <div class="card-body d-flex align-items-center">
            <i class="bi ${a.icon} me-3" style="font-size:2rem; color:${isUnlocked ? '#28a745' : '#aaa'}"></i>
            <div>
              <h6 class="mb-1">${a.label}</h6>
              <span class="badge ${isUnlocked ? 'bg-success' : 'bg-secondary'}">${isUnlocked ? 'Desbloqueada' : 'Pendente'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('') + '</div>';
}

// Garante que os event listeners do botão de adicionar atividade e do formulário sejam reatribuídos após carregar a tela de atividades dinamicamente.
function setupActivityListeners() {
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
  const activityForm = document.getElementById('activityForm');
  if (activityForm) {
    activityForm.onsubmit = function(e) {
      e.preventDefault();
      const name = document.getElementById('activityName').value.trim();
      const start = document.getElementById('startTime').value;
      const end = document.getElementById('endTime').value;
      const days = getSelectedDays();
      if (!name || !start || !end) return;
      if (days.length === 0) {
        alert('Selecione pelo menos um dia da semana para a atividade.');
        return;
      }
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      let user = users.find(u => u.email === currentUser.email);
      if (!user) return;
      const editIdx = document.getElementById('activityModal').getAttribute('data-edit-idx');
      if (editIdx === '') {
        // Adiciona nova atividade
        user.routine.push({ name, start, end, days });
      } else {
        // Edita atividade existente
        user.routine[editIdx] = { name, start, end, days };
      }
      localStorage.setItem('users', JSON.stringify(users));
      currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      loadRoutine();
      let modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
      modal.hide();
    };
  }
}

// Modal de parabéns ao concluir atividade com bg escuro e texto esmeralda
function showCongratsModal(msg) {
  let modalDiv = document.getElementById('congratsModal');
  if (!modalDiv) {
    modalDiv = document.createElement('div');
    modalDiv.id = 'congratsModal';
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = -1;
    modalDiv.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background:#23272b; color:#2ecc71;">
          <div class="modal-header" style="background:#181a1b; color:#2ecc71;">
            <h5 class="modal-title">Parabéns!</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" style="filter:invert(60%) sepia(100%) saturate(500%) hue-rotate(90deg);"></button>
          </div>
          <div class="modal-body text-center">
            <div class="mb-3"><i class="bi bi-emoji-smile" style="font-size:2.5rem;color:#2ecc71;"></i></div>
            <div id="congratsMsg">${msg}</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  } else {
    modalDiv.querySelector('#congratsMsg').innerHTML = msg;
  }
  let modal = new bootstrap.Modal(modalDiv);
  modal.show();
}

// Função para resetar progresso semanal e atualizar estatísticas
function resetWeeklyProgress() {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  users.forEach(user => {
    if (!user.routine) return;
    // Estatísticas semanais
    let weekStats = user.weekStats || [];
    let completedCount = user.routine.filter(act => act.completed).length;
    let weekNumber = getWeekNumber(new Date());
    weekStats.push({ week: weekNumber, completed: completedCount });
    user.weekStats = weekStats;
    // Estatísticas mensais
    let monthStats = user.monthStats || [];
    let month = new Date().getMonth();
    let year = new Date().getFullYear();
    let monthKey = `${year}-${month}`;
    let monthEntry = monthStats.find(m => m.month === monthKey);
    if (monthEntry) {
      monthEntry.completed += completedCount;
    } else {
      monthStats.push({ month: monthKey, completed: completedCount });
    }
    user.monthStats = monthStats;
    // Reset progresso semanal
    user.routine.forEach(act => act.completed = false);
  });
  localStorage.setItem('users', JSON.stringify(users));
  if (currentUser) {
    currentUser = users.find(u => u.email === currentUser.email);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadRoutine();
  }
}

// Função para obter número da semana do ano
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

// Agenda reset semanal toda segunda-feira às 00:00
function scheduleWeeklyReset() {
  const now = new Date();
  // Próxima segunda-feira às 00:00
  let daysUntilMonday = (8 - now.getDay()) % 7;
  const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday, 0, 0, 0);
  const msUntilMonday = nextMonday - now;
  setTimeout(() => {
    resetWeeklyProgress();
    scheduleWeeklyReset();
  }, msUntilMonday + 1000);
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  loadRoutine();
  scheduleMidnightUpdate();
  scheduleWeeklyReset();
});
