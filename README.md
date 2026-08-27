# Northstar Login Authentication System

A complete client-side login authentication demo built with HTML5, CSS3, vanilla JavaScript, LocalStorage, and the Web Crypto API.

## Objective

Register users, hash their passwords with SHA-256, sign in with a username or email, protect a dashboard with a local session, and log out cleanly.

## Features

- Responsive login and registration pages
- Required-field and password validation
- Passwords hashed with Web Crypto API SHA-256 before storage
- Duplicate username and email detection
- Generic invalid-credential login message
- Protected dashboard with active session status
- LocalStorage-based logout and redirect protection
- Accessible labels, focus states, live validation messages, and responsive layout

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage
- Web Crypto API

## How Registration Works

The registration form validates required fields, checks password length and number requirements, confirms matching passwords, and checks for duplicate usernames or emails. A new user record is saved with the username, email, and SHA-256 password hash. The original password is never stored.

## How Login Works

The entered username or email is matched against registered records. The entered password is hashed with SHA-256 and compared with the stored hash. Successful login creates a separate session record and redirects to the dashboard. Incorrect credentials always use the generic message: `Invalid username/email or password.`

## Password Hashing

`crypto.subtle.digest('SHA-256', ...)` converts the password into a hexadecimal hash in the browser. This demo does not store or display the original password.

## Session Management

Registered users are stored under `northstar_users`. The active session is stored separately under `northstar_session` with the signed-in username, a random session token, and a creation timestamp. The dashboard confirms that the session token exists and that its user still exists before showing protected content. Logout removes the session key and redirects to the login page.

## How to Run

Open `index.html` in a modern browser. For the most consistent Web Crypto API behavior, serve the folder through a local static server such as VS Code Live Server or `npx serve .`, then visit the local URL.

## Important Security Note

This LocalStorage authentication system is intended for learning and demonstration purposes only. LocalStorage can be read or modified by scripts running in the page, so this is not a replacement for secure server-side authentication, HTTPS, secure cookies, salted password hashing, rate limiting, or a real database.
