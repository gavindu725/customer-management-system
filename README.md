# Customer Management System

Full-stack assignment project to manage customers, addresses, phone numbers, family relationships, and bulk customer upload via Excel.

## 1. Project Overview

This system includes:

- Backend API built with Spring Boot and JPA
- Frontend web app built with Next.js
- MariaDB as the main database
- Bulk upload support for large .xlsx files

Main capabilities:

- Create, update, fetch, and list customers
- Maintain customer addresses and phone numbers
- Manage family member relationships between customers
- Load master data (countries and cities)
- Bulk import customers from Excel

## 2. Tech Stack

### Backend

- Java 8
- Spring Boot 2.7.18
- Spring Data JPA
- MariaDB JDBC Driver
- MapStruct + Lombok
- Apache POI (streaming Excel processing)

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Axios
- React Query
- Tailwind CSS

### Database

- MariaDB

## 3. Repository Structure

```text
customer-management-system/
	backend/   -> Spring Boot REST API
	frontend/  -> Next.js web client
```

## 4. Prerequisites

Install the following:

- Java 8
- Node.js 20+
- npm
- MariaDB (running locally)

Recommended local ports:

- Backend: 8080
- Frontend: 3000
- MariaDB: 3307

## 5. Environment Configuration

### Backend Environment

File: backend/.env

```env
SPRING_DATASOURCE_URL=jdbc:mariadb://localhost:3307/cms_db?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=
SERVER_PORT=8080
```

Note:

- The backend also has safe fallback defaults in application.properties.
- The DB can auto-create if it does not exist.

### Frontend Environment

File: frontend/.env

```env
BACKEND_API_BASE_URL=http://localhost:8080
```

Important:

- Frontend requests use same-origin /api/v1 and are proxied by Next.js rewrite to BACKEND_API_BASE_URL.
- This works for localhost and Dev Tunnels.

## 6. Database Setup

You can initialize schema and seed data using:

- backend/src/main/resources/db/ddl.sql
- backend/src/main/resources/db/dml.sql

Run these scripts in MariaDB if you want preloaded sample data.

## 7. Run the Project

### 7.1 Start Backend

From backend folder:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Expected result:

- Spring Boot starts successfully
- Tomcat listens on port 8080

### 7.2 Start Frontend

From frontend folder:

```bash
npm install
npm run dev
```

Open:

- http://localhost:3000

## 8. API Summary

Base path: /api/v1

### Customers

- GET /customers
- GET /customers/{id}
- POST /customers
- PUT /customers/{id}

### Bulk Upload

- POST /customers/bulk/upload
  - Content-Type: multipart/form-data
  - Accepts .xlsx file

### Master Data

- GET /master/countries
- GET /master/countries/{countryId}/cities
- GET /master/cities

## 9. CORS and Dev Tunnel

Backend currently allows these frontend origins:

- http://localhost:3000
- https://g83n1220-3000.asse.devtunnels.ms

If your tunnel URL changes, update backend/src/main/java/gvk/projects/cms/config/WebConfig.java.

## 10. Common Issues and Fixes

### Backend exits immediately after run

Cause:

- Startup exception (DB settings, port issue, etc.)

Fix:

- Read backend startup logs for root cause.
- Confirm MariaDB is running and reachable.

### Java class version mismatch (65.0 vs 52.0)

Cause:

- Stale compiled classes from newer JDK.

Fix:

```bash
./mvnw clean
./mvnw -DskipTests compile
./mvnw spring-boot:run
```

### Frontend ERR_CONNECTION_REFUSED to localhost:8080

Cause:

- Backend not running or not reachable.

Fix:

- Start backend first.
- Ensure only one backend instance runs on port 8080.

## 11. Submission Checklist

- Backend runs on Java 8
- Frontend runs on Node environment
- MariaDB connection works
- Customer CRUD endpoints working
- Master data endpoints working
- Bulk upload endpoint working
- README includes setup and run instructions

---

Prepared for assignment submission.
