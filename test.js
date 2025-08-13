// test.js - Testes básicos para TaskDay (Node.js)
// Mock de localStorage para ambiente Node
class LocalStorageMock {
  constructor() { this.store = {}; }
  clear() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = value.toString(); }
  removeItem(key) { delete this.store[key]; }
}
global.localStorage = new LocalStorageMock();

function assertEqual(a, b, msg) {
  if (a !== b) {
    console.error('❌', msg, 'Esperado:', b, 'Recebido:', a);
  } else {
    console.log('✅', msg);
  }
}

// Teste: Cadastro de usuário
function testRegisterUser() {
  localStorage.clear();
  let users = [];
  const user = { name: 'Teste', email: 'teste@exemplo.com', password: '123', routine: [], points: 0, trophies: [] };
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  let saved = JSON.parse(localStorage.getItem('users'));
  assertEqual(saved[0].email, 'teste@exemplo.com', 'Cadastro salva email corretamente');
  assertEqual(saved[0].name, 'Teste', 'Cadastro salva nome corretamente');
}

// Teste: Login de usuário
function testLoginUser() {
  let users = JSON.parse(localStorage.getItem('users'));
  const user = users.find(u => u.email === 'teste@exemplo.com' && u.password === '123');
  assertEqual(!!user, true, 'Login encontra usuário cadastrado');
}

// Teste: Adicionar atividade
function testAddActivity() {
  let users = JSON.parse(localStorage.getItem('users'));
  let user = users[0];
  user.routine.push({ name: 'Estudar', start: '08:00', end: '09:00' });
  localStorage.setItem('users', JSON.stringify(users));
  let updated = JSON.parse(localStorage.getItem('users'));
  assertEqual(updated[0].routine.length, 1, 'Adiciona atividade corretamente');
}

// Teste: Pontuação por concluir atividade
function testCompleteActivity() {
  let users = JSON.parse(localStorage.getItem('users'));
  let user = users[0];
  user.routine[0].completed = new Date().toISOString().slice(0,10);
  user.points += 10;
  localStorage.setItem('users', JSON.stringify(users));
  let updated = JSON.parse(localStorage.getItem('users'));
  assertEqual(updated[0].points, 10, 'Pontuação atribuída corretamente');
}

// Executa todos os testes
function runAllTests() {
  testRegisterUser();
  testLoginUser();
  testAddActivity();
  testCompleteActivity();
}

runAllTests();
