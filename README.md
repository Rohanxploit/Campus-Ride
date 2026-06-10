# 🛺 Campus Ride: Real-Time Ride Management Platform

## Project Overview
A full-stack, real-time ride management system built to seamlessly connect passengers and e-rickshaw drivers within a large campus environment. This platform completely eliminates fragmented transportation by utilizing millisecond-precision GPS tracking, open-source routing APIs, and bi-directional WebSocket communication.

---

## Technology Stack
* **Frontend:** React.js, Vite, React Router DOM, Leaflet.js (Map), OSRM (Routing API)
* **Backend:** Node.js, Express.js, Socket.IO
* **Database:** Prisma ORM, SQLite 
* **Security:** JWT (JSON Web Tokens), Bcrypt Password Hashing
* **Architecture:** See `DESIGN.md` for a comprehensive technical breakdown.

---

## Setup Instructions
Because this project relies on WebSockets and Mobile GPS, it requires a specific network setup to demonstrate properly on mobile devices.

### 1. Database & Backend Setup
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 2. Frontend Setup
Open a **second** terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
```

---

## Running the Application

### 1. Start the Servers
In the **backend** terminal, run:
```bash
npm start
```
*(The backend and Socket hub will start on `http://0.0.0.0:5000`)*

In the **frontend** terminal, run:
```bash
npm run dev -- --host
```
*(The `--host` flag exposes the Vite server to your local Wi-Fi network)*

### 2. Live Device Testing
1. Connect your Laptop and your Mobile Phones to the **exact same Wi-Fi network** (or use a Mobile Hotspot).
2. Look at the Vite terminal output to find your local IPv4 address (e.g., `http://192.168.x.x:5173`).
3. Open that exact IPv4 address in the web browser on your phones.
4. **Important:** Your phone browser will ask for Location Permissions. You **must** click "Allow" for the live map tracking and OSRM routing to function.

---

## Feature List

- **Real-Time Fleet Tracking:** Live, moving E-Rickshaw icons rendered on a Leaflet map using high-accuracy HTML5 Geolocation API directly hooked into mobile GPS hardware.
- **Advanced Navigation UI (OSRM):** Fully integrated Open Source Routing Machine (OSRM) calculating real-world curved street routes, complete with animated "flowing" route lines and a massive Google Maps-style Turn-by-Turn navigation UI overlay.
- **Bi-Directional Sockets:** The entire application state (Ride Requests, Acceptances, Live GPS, and Arrivals) is pushed instantaneously via Socket.IO, eliminating legacy HTTP polling loops.
- **Strict Concurrency Safety:** Mathematical Haversine geofencing (driver must be < 200m to arrive), physical OTP handshakes to start rides, and rigorous database transaction locks to prevent "race condition" double-bookings.
- **Modern Glassmorphism UI:** Built with Vite and React, featuring an ultra-premium, deeply customized dark/light CSS design system packed with micro-animations.
- **Complete End-to-End Flows:** Includes a full Profile Hub, Settings UI, Help & Support center, and a dynamic UPI digital payment and 5-star rating simulator upon ride completion.

### Application Workflow
1. **Ride Request:** Passenger selects a destination coordinate on the map and requests a ride.
2. **Driver Assignment:** Available drivers receive the broadcast. The first to accept is assigned, and a database lock prevents concurrent assignments.
3. **Live Tracking:** The passenger map centers on the assigned driver and tracks their GPS coordinates in real-time.
4. **Pickup & OTP Verification:** The driver must arrive within a 200m geofence. The passenger provides a 4-digit OTP to securely initiate the ride.
5. **Navigation:** The driver's map fetches OSRM routing data to display turn-by-turn navigation paths.
6. **Completion:** Upon reaching the destination, the ride concludes, routing the passenger to the UPI payment and feedback gateway.
