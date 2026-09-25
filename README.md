# Password Encryption Demo

A small signup/login demo built for a school project. It does two things:

1. **Live password strength feedback** — as the user types, a checklist shows
   whether the password has an uppercase letter, a lowercase letter, a
   number, a special character, and at least 8 characters, plus a
   strength meter.
2. **Password encryption (hashing) at rest** — the server never stores the
   password itself. It stores a one-way `bcrypt` hash instead
   (`bcrypt.hash`), and login checks a submitted password against that hash
   with `bcrypt.compare`. Even if the data file leaked, the original
   passwords could not be read back out of it.

> Note on terminology: this uses *hashing*, not reversible *encryption*.
> That's intentional and is the correct/standard way to store passwords —
> the server should never be able to recover a user's plaintext password.
> If your assignment specifically requires reversible encryption (e.g. for
> data other than login passwords), that's a different technique (AES) —
> say so and it can be added separately.

## Project structure

```
server.js          Express server: /api/signup and /api/login routes
public/
  index.html        Sign up / log in UI
  style.css         Styling
  script.js         Live password-strength checklist + API calls
data/users.json     Created automatically; stores {username, passwordHash}
```

## Running it

```bash
npm install
npm start
```

Then open http://localhost:3000

## How the password rules work

Both the browser (`public/script.js`) and the server (`server.js`) enforce
the same rules, so the check can't be bypassed by calling the API directly:

- at least 8 characters
- at least one lowercase letter
- at least one uppercase letter
- at least one number
- at least one special character
