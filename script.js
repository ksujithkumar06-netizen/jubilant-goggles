const USERS_KEY = 'northstar_users';
const SESSION_KEY = 'northstar_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Hash credentials before storage or comparison; the original password never enters LocalStorage.
async function hashPassword(password) {
  if (!window.crypto?.subtle) {
    throw new Error('Secure hashing is unavailable in this browser.');
  }
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function validatePassword(password) {
  return password.length >= 8 && /\d/.test(password);
}

function isDuplicateUser(username, email) {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  return getUsers().some(user => user.username.toLowerCase() === normalizedUsername || user.email.toLowerCase() === normalizedEmail);
}

function setMessage(element, message, success = false) {
  element.textContent = message;
  element.classList.toggle('success', success);
}

function markInvalid(input, messageElement, message) {
  input.classList.toggle('invalid', Boolean(message));
  setMessage(messageElement, message);
}

async function registerUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmation = form.confirmPassword.value;
  const registerMessage = document.getElementById('registerMessage');
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  let hasError = false;

  markInvalid(form.username, document.getElementById('usernameMessage'), username ? '' : 'Username is required.');
  markInvalid(form.email, document.getElementById('emailMessage'), email && emailIsValid ? '' : 'Enter a valid email address.');
  markInvalid(form.password, document.getElementById('registerPasswordMessage'), validatePassword(password) ? '' : 'Use at least 8 characters and 1 number.');
  markInvalid(form.confirmPassword, document.getElementById('confirmMessage'), password === confirmation && confirmation ? '' : 'Passwords must match.');
  hasError = !username || !emailIsValid || !validatePassword(password) || password !== confirmation;

  if (hasError) {
    setMessage(registerMessage, 'Please review the highlighted fields.');
    return;
  }
  if (isDuplicateUser(username, email)) {
    setMessage(registerMessage, 'That username or email is already registered.');
    return;
  }

  try {
    const users = getUsers();
    users.push({ username, email: email.toLowerCase(), passwordHash: await hashPassword(password), createdAt: new Date().toISOString() });
    saveUsers(users);
    form.reset();
    setMessage(registerMessage, 'Account created. Redirecting you to sign in...', true);
    window.setTimeout(() => { window.location.href = 'index.html'; }, 900);
  } catch (error) {
    setMessage(registerMessage, 'Unable to create your account in this browser.');
  }
}

async function loginUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const identity = form.identity.value.trim();
  const password = form.password.value;
  const message = document.getElementById('loginMessage');
  const identityMessage = document.getElementById('identityMessage');
  const passwordMessage = document.getElementById('passwordMessage');
  markInvalid(form.identity, identityMessage, identity ? '' : 'Username or email is required.');
  markInvalid(form.password, passwordMessage, password ? '' : 'Password is required.');

  if (!identity || !password) {
    setMessage(message, 'Please enter your username or email and password.');
    return;
  }
  try {
    const passwordHash = await hashPassword(password);
    const identityLower = identity.toLowerCase();
    const user = getUsers().find(candidate => candidate.username.toLowerCase() === identityLower || candidate.email.toLowerCase() === identityLower);
    if (!user || user.passwordHash !== passwordHash) {
      setMessage(message, 'Invalid username/email or password.');
      return;
    }
    const token = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, token, createdAt: new Date().toISOString() }));
    window.location.href = 'dashboard.html';
  } catch (error) {
    setMessage(message, 'Unable to sign in in this browser.');
  }
}

function getActiveSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    const user = session && getUsers().find(candidate => candidate.username === session.username);
    return session?.token && user ? { session, user } : null;
  } catch (error) {
    return null;
  }
}

function checkSession() {
  const active = getActiveSession();
  if (!active) {
    window.location.replace('index.html');
    return;
  }
  document.getElementById('dashboardContent').hidden = false;
  document.getElementById('welcomeUsername').textContent = active.user.username;
  document.getElementById('accountUsername').textContent = active.user.username;
  document.getElementById('accountEmail').textContent = active.user.email;
  document.getElementById('userInitial').textContent = active.user.username.charAt(0).toUpperCase();
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  window.location.replace('index.html');
}

const page = document.body.dataset.page;
if (page === 'register') document.getElementById('registerForm').addEventListener('submit', registerUser);
if (page === 'login') document.getElementById('loginForm').addEventListener('submit', loginUser);
if (page === 'dashboard') {
  checkSession();
  document.getElementById('logoutButton').addEventListener('click', logoutUser);
}
