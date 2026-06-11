# Full-Stack User Authentication System
# By:Itay Laznik

A complete, decoupled full-stack user registration and authentication application. Built with React on the frontend and a Node.js/Express backend, this project leverages PostgreSQL for persistent storage and incorporates secure password hashing, JWT-based session management, and real-time Socket.io connections.

## 🚀 Features

* **Secure Authentication:** User registration and login flow using industry-standard practices.
* **Password Hashing:** Passwords are cryptographically hashed using `bcrypt` before database insertion.
* **JWT Authorization:** Stateless, secure token-based authentication for managing user sessions.
* **Real-time WebSockets:** `Socket.io` integration for seamless, instant client-server communication.
* **Decoupled Architecture:** Clean separation between the React UI (`/frontend`) and API logic (`/backend`).

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (via `pg` or `pg-pool`)
* **Real-time & Security:** Socket.io, JSON Web Tokens (JWT), bcrypt

---

## ⚙️ Local Setup & Installation

To run this project locally, you will need to have **Node.js** and **PostgreSQL** installed on your machine.

### 1. Clone the repository
```bash
git clone [https://github.com/itaylz/basic-user-login-api.git](https://github.com/itaylz/basic-user-login-api.git)
cd basic-user-login-api
