// --- Tab switching ---
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}-form`).classList.add('active');
  });
});

// --- Live password strength checklist ---
const passwordInput = document.getElementById('signup-password');
const ruleItems = document.querySelectorAll('#rules li');
const strengthFill = document.getElementById('strength-fill');
const strengthLabel = document.getElementById('strength-label');

const RULES = {
  length: (pw) => pw.length >= 8,
  lower: (pw) => /[a-z]/.test(pw),
  upper: (pw) => /[A-Z]/.test(pw),
  number: (pw) => /[0-9]/.test(pw),
  special: (pw) => /[^A-Za-z0-9]/.test(pw),
};

function evaluatePassword(pw) {
  let passed = 0;
  ruleItems.forEach((li) => {
    const rule = li.dataset.rule;
    const ok = RULES[rule](pw);
    li.classList.toggle('valid', ok);
    if (ok) passed++;
  });
  return passed;
}

const STRENGTH_LEVELS = [
  { label: 'too short', color: '#ef4444', width: '10%' },
  { label: 'weak', color: '#ef4444', width: '25%' },
  { label: 'fair', color: '#f59e0b', width: '50%' },
  { label: 'good', color: '#eab308', width: '75%' },
  { label: 'strong', color: '#16a34a', width: '100%' },
];

passwordInput.addEventListener('input', () => {
  const pw = passwordInput.value;
  const passed = pw.length === 0 ? 0 : evaluatePassword(pw);
  const level = STRENGTH_LEVELS[passed] ?? STRENGTH_LEVELS[STRENGTH_LEVELS.length - 1];
  strengthFill.style.width = level.width;
  strengthFill.style.backgroundColor = level.color;
  strengthLabel.textContent = `Password strength: ${level.label}`;
});

// --- Sign up ---
const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signup-username').value.trim();
  const password = passwordInput.value;

  const passed = evaluatePassword(password);
  if (passed < 5) {
    showMessage(signupMessage, 'Please satisfy every password requirement above.', false);
    return;
  }

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    showMessage(signupMessage, data.message || data.error, res.ok);
    if (res.ok) signupForm.reset();
  } catch {
    showMessage(signupMessage, 'Could not reach the server. Is it running?', false);
  }
});

// --- Log in ---
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    showMessage(loginMessage, data.message || data.error, res.ok);
  } catch {
    showMessage(loginMessage, 'Could not reach the server. Is it running?', false);
  }
});

function showMessage(el, text, isSuccess) {
  el.textContent = text;
  el.className = `message ${isSuccess ? 'success' : 'error'}`;
}
