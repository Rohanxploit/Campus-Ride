# Design Document: Real-Time Campus Mobility Platform

## 1. Problem Understanding
Campuses require efficient last-mile transportation. Currently, finding a ride relies on unorganized, ad-hoc methods. This project solves this by introducing a centralized digital platform to manage driver dispatch, ride states, and passenger-driver communication in real-time.

## 2. System Architecture
The application uses a modern client-server architecture:
- **Frontend (Client):** A React application providing separate dashboards for Passengers and Drivers. It communicates with the backend via REST APIs for stateless operations and WebSockets for real-time events.
- **Backend (Server):** An Express Node.js server handling business logic, authentication, and database operations. A Socket.IO server is attached to the same HTTP server to push real-time updates.
- **Database:** Prisma ORM connected to a SQLite database (for local dev) ensuring data integrity.

## 3. Database Schema Overview
- **User:** Stores credentials and role (`PASSENGER` or `DRIVER`).
- **Vehicle:** Stores driver vehicle details (linked 1-to-1 with User).
- **Ride:** Tracks `pickup`, `destination`, `status`, and relations to `Passenger` and `Driver`.
- **Rating:** Tracks passenger feedback linked to a completed ride.

## 4. API & WebSocket Events
**REST API:**
- `POST /api/auth/register` & `login`: User Authentication
- `POST /api/rides/request`: Create a new ride
- `GET /api/rides/active`: Fetch current active ride state

**WebSocket Events:**
- `new_ride_request`: Broadcasts to all online drivers.
- `accept_ride`: Driver accepts request, server updates DB and notifies passenger.
- `update_ride_status`: Transitions ride state (IN_PROGRESS, COMPLETED).
- `update_location`: Driver periodically sends lat/lng.

## 5. Design Decisions
- **Vanilla CSS:** Chosen for complete control over micro-animations and to create a premium, glassmorphic dark-mode aesthetic without relying on bulky UI libraries.
- **Socket.IO:** Selected over standard WebSockets or SSE for its robust fallback mechanisms and built-in room support (`user_${id}` and `ride_${id}`).
- **SQLite:** Used for the database to ensure reviewers can easily run the project locally without installing PostgreSQL or Docker, while Prisma allows easy migration to Postgres later.
