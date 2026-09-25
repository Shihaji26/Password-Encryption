const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const SALT_ROUNDS = 10;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Same rules enforced client-side, re-checked here so the API can't be bypassed.
function getPasswordIssues(password) {
  const issues = [];
  if (!password || password.length < 8) issues.push('at least 8 characters');
  if (!/[a-z]/.test(password || '')) issues.push('a lowercase letter');
  if (!/[A-Z]/.test(password || '')) issues.push('an uppercase letter');
  if (!/[0-9]/.test(password || '')) issues.push('a number');
  if (!/[^A-Za-z0-9]/.test(password || '')) issues.push('a special character');
  return issues;
}

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const issues = getPasswordIssues(password);
  if (issues.length > 0) {
    return res.status(400).json({ error: `Password must contain ${issues.join(', ')}.` });
  }

  const users = readUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'That username is already taken.' });
  }

  // The plaintext password is never stored — only this one-way hash is.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  users.push({ username, passwordHash });
  writeUsers(users);

  res.status(201).json({ message: 'Account created successfully.' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};

  const users = readUsers();
  const user = users.find((u) => u.username.toLowerCase() === (username || '').toLowerCase());

  // Compare against the stored hash; the original password is never recoverable from it.
  const match = user ? await bcrypt.compare(password || '', user.passwordHash) : false;

  if (!match) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  res.json({ message: `Welcome back, ${user.username}!` });
});

app.listen(PORT, () => {
  console.log(`Password Encryption demo running at http://localhost:${PORT}`);
});
