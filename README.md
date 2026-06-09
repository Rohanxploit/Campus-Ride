# Real-Time Campus Mobility Platform

A comprehensive ride management system built to seamlessly connect passengers and drivers within a campus environment.

## Features
- **User Authentication:** Secure JWT-based login/registration for Passengers and Drivers.
- **Real-Time Tracking:** Instant ride updates and live driver tracking using Socket.IO.
- **Driver Dashboard:** Toggle availability, receive incoming requests, and track earnings/stats.
- **Passenger Dashboard:** Request rides, view live Google Map updates, and track driver details.

## Technology Stack
- **Frontend:** React (Vite), React Router, Context API, Vanilla CSS (Glassmorphism & Dark Mode)
- **Backend:** Node.js, Express, Socket.IO
- **Database:** SQLite (for local development) via Prisma ORM


## Setup Instructions
### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Generate Prisma client & push DB schema: `npx prisma db push` then `npx prisma generate`
4. Start the server: `node index.js` (The server runs on port 5000)

### 2. Frontend Setup
1. Open a terminal and navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Add your Google Maps API key in `src/pages/PassengerDashboard.jsx`.
4. Start the development server: `npm run dev`

## Running the Application
Open `http://localhost:5173` in two different browser windows (or incognito mode) to test the real-time passenger-driver interactions. Register one account as a PASSENGER and another as a DRIVER.


