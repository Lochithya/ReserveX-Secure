# 📚 ReserveX - Book Fair Stall Booking System

**ReserveX** is a modern, full-stack web application designed to manage stall reservations for the Colombo International Book Fair. It provides a seamless, interactive experience for book vendors to select, reserve, and manage their stalls, while offering administrators a powerful dashboard to oversee the entire event.

> **Academic Context:** This project was developed as the group assignment for the **SENG 22212 – Software Architecture and Design** module at the University of Kelaniya.

## ✨ Key Features

* **Interactive Floor Plan:** A dynamic, grid-based live map allowing vendors to visually select available stalls.
* **Dual-Portal Architecture:** * **Online Portal:** For vendors to browse the map, book up to 3 stalls, and assign specific literary genres to their spaces.
    * **Admin Portal:** For event organizers to manage stall availability, view booking statistics via a live dashboard, and oversee vendor accounts.
* **Secure Authentication:** Role-based access control (Vendor vs. Admin/Employee) secured by JSON Web Tokens (JWT).
* **Automated Email Notifications:** Vendors receive instant confirmation emails with a QR code receipt upon successful reservation.
* **Real-time Analytics:** Visual dashboards utilizing pie charts and dynamic stats calculations.
## Project Modules

- `backend`: Spring Boot REST API with JWT authentication, role-based access, MySQL persistence, and email support.
- `online-portal`: Vendor-facing React app for authentication, stall browsing, reservations, and profile actions.
- `admin-portal`: Admin/employee React app for monitoring reservations and managing stalls.
- `database`: Data model reference (`db.sql`).

## Tech Stack

- **Backend**: Java 17, Spring Boot, Spring Security, Spring Data JPA, MySQL, Maven
- **Frontend**: React, Vite, Axios, React Router
- **Other**: JWT, SMTP email integration


## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ and npm
- MySQL

### 1) Run Backend

```bash
cd backend
mvnw.cmd spring-boot:run
```

Backend runs on `http://localhost:8080` by default.

### 2) Run Online Portal

```bash
cd online-portal
npm install
npm run dev
```

### 3) Run Admin Portal

```bash
cd admin-portal
npm install
npm run dev
```

## 🔐 Auth0 OIDC Authentication Setup

ReserveX supports cloud-based OpenID Connect (OIDC) authentication using **Auth0** for seamless, passwordless vendor account creation and Single Sign-On (SSO).

### 1. Auth0 Dashboard Setup
1. **Create an Application**:
   * Type: **Single Page Application (SPA)**
   * Allowed Callback URLs: `http://localhost:5173`, `http://localhost:5173/`
   * Allowed Logout URLs: `http://localhost:5173/login`, `http://localhost:5173`
   * Allowed Web Origins: `http://localhost:5173`
2. **Create an API (Audience)**:
   * Identifier: `https://reservex-api/`
   * Signing Algorithm: `RS256`

### 2. Environment Variables Configuration

#### Online Portal (`online-portal/.env`):
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AUTH0_DOMAIN=dev-your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://reservex-api/
```

#### Backend (`backend/.env`):
```env
DB_URL=jdbc:mysql://localhost:3306/defaultdb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_password

AUTH0_DOMAIN=dev-your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://reservex-api/
JWT_SECRET=your_local_jwt_secret
```

---

## 🛡️ Security & OWASP Mitigations
* **OIDC Token Verification**: Backend validates Auth0 RS256 JWT signatures dynamically against Auth0's JWKS (`.well-known/jwks.json`) endpoint.
* **Just-In-Time (JIT) Provisioning**: New vendors authenticating via Auth0 are automatically provisioned in MySQL with `role = 'VENDOR'` and `password = NULL`.
* **Access Control & IDOR Prevention**: Reservation access is strictly resolved from the authenticated user token principal.
* **SQL Injection & XSS Protection**: All database queries utilize Spring Data JPA / Hibernate parameterized queries.

---

## Academic Context

**Assessment 2: Secure Web Application Development**  
Information Security Coursework Deliverable

