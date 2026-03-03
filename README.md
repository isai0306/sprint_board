## Sprint Board - Real-Time Collaborative Task Board

Production-ready real-time sprint board with Spring Boot 3 backend and React (Vite) frontend.

### Structure

- `backend-spring/` – Spring Boot 3, Spring Security (JWT), Spring Data JPA (MySQL), WebSocket (STOMP).
- `frontend/` – React + Vite SPA with plain CSS, Axios, drag & drop, and STOMP client.

### Backend setup (Spring Boot)

1. Ensure you have **Java 17+** and **Maven** installed.
2. Create a MySQL database, for example:
   - Database name: `sprint_board`
3. Copy `backend-spring/.env.example` to `.env` in the same folder and adjust:
   - `SPRINTBOARD_DB_USERNAME`
   - `SPRINTBOARD_DB_PASSWORD`
   - `SPRINTBOARD_JWT_SECRET` (use a long random string)
4. From the project root:
   - `cd backend-spring`
   - Run the app:
     - `mvn spring-boot:run`
5. The backend will start on `http://localhost:8080` with REST APIs under `/api` and WebSocket endpoint at `/ws`.

### Frontend setup (React + Vite)

1. Ensure you have **Node.js 18+** and **npm** installed.
2. From the project root:
   - `cd frontend`
   - `npm install`
3. Copy `frontend/.env.example` to `.env` and adjust if needed:
   - `VITE_API_BASE_URL` (defaults to `http://localhost:8080`)
   - `VITE_WS_URL` (defaults to `http://localhost:8080/ws`)
4. Start the dev server:
   - `npm run dev`
5. Open the app at the URL shown in the terminal (typically `http://localhost:5173`).

### How to use

1. Register a new user or log in.
2. Create a board from the **Boards** page.
3. Open a board to see the kanban view with columns (Backlog, To Do, In Progress, Review, Done).
4. Create tasks, drag them between columns, assign to yourself, comment, and see activity updates in real time via WebSocket.

