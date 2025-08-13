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

// ...existing code...
