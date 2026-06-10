# 🏛️ Campus Ride: Technical Design Document

This document outlines the architectural decisions, data flow, and technology stack powering the Campus Ride real-time ride management platform.

---

## 1. System Architecture Overview
The platform utilizes a modern Client-Server architecture heavily reliant on real-time event-driven communication.

### 📡 Real-Time Communication Layer (Socket.IO)
While standard HTTP APIs (Express.js) handle static operations like authentication and profile management, the entire core ride experience is powered by **Socket.IO WebSockets**. 
- **Bi-directional Flow:** Allows the server to push state changes to the client instantly without expensive long-polling.
- **Connection Resilience:** Automatically handles dropouts by re-establishing connections and placing users back into their respective "Ride Rooms" upon reconnection.

### 🗺️ Geospatial & Routing Engine
Instead of relying on costly, proprietary APIs like Google Maps, the platform implements an open-source mapping stack:
- **Leaflet.js:** Renders the map UI and custom hardware-accelerated animated markers.
- **OSRM (Open Source Routing Machine):** An open-source routing API used to calculate the exact street-level curved paths between coordinates, powering the dynamic Turn-by-Turn navigation UI.
- **HTML5 Geolocation API:** Forced into `enableHighAccuracy` mode to communicate directly with mobile GPS hardware for millisecond-precision tracking.

---

## 2. Technology Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend UI** | React.js (Vite) | Lightning-fast HMR and modular component architecture. |
| **Frontend Styling** | Vanilla CSS | Completely custom Glassmorphism aesthetic without the overhead of heavy CSS frameworks. |
| **Backend API** | Node.js / Express.js | Lightweight, non-blocking I/O perfect for concurrent socket connections. |
| **Database ORM** | Prisma | Provides strict type safety and a highly readable schema. |
| **Database** | SQLite | Zero-configuration SQL database, perfect for high-speed hackathon portability. |
| **Authentication** | JWT & Bcrypt | Stateless, secure, and easily verifiable tokenized sessions. |

---

## 3. The Ride Lifecycle (Event Flow)

1. **`REQUESTED`:** Passenger submits pickup/drop-off coordinates. A database lock is established.
2. **`ACCEPTED`:** Driver accepts. The backend validates the request hasn't been claimed by a race-condition, assigns the driver, and broadcasts to the passenger.
3. **`ARRIVED`:** Driver approaches the passenger. A Haversine formula calculation ensures the driver is within a **200-meter geofence** before allowing the "I Have Arrived" trigger.
4. **`IN_PROGRESS`:** The passenger provides a mathematically generated 4-digit OTP to the driver. The app establishes a WebSocket loop, broadcasting the driver's GPS location every few seconds. The OSRM API begins polling for street directions.
5. **`COMPLETED`:** Ride ends, socket loops terminate, and the passenger is served the dynamic UPI payment and 5-star rating flow.

---

## 4. Security & Concurrency
- **Strict Concurrency:** A driver cannot accept a ride if `status !== 'REQUESTED'`. This prevents the "Double Booking" problem common in highly concurrent hackathon apps.
- **OTP Verification:** Ride initiation is physically secured via a 4-digit PIN, eliminating fraudulent driver pickups.
- **Secure Password Hashing:** All passwords are mathematically salted and hashed via `bcrypt` before ever touching the database.
