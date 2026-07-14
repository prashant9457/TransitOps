# TransitOps

**[Watch the Full Demonstration Video](https://drive.google.com/file/d/1ZdTKtVYBmlVPSjEvTiFTtGky59oQoMWv/view?usp=sharing)**

**TransitOps** is an intelligent, end-to-end Fleet and Transport Management platform designed to streamline logistics, vehicle maintenance, and driver operations. Built with a robust backend and a highly interactive, modern frontend, it bridges the gap between administrative oversight and driver execution.

## How It Works
TransitOps simplifies fleet management into three core workflows:
1. **Dispatch & Trip Management:** Admins create and assign trips to available drivers. Drivers accept these trips, execute them while tracking expenses (tolls, fuel), and complete them, automatically updating the system in real-time.
2. **Fleet Tracking & Maintenance:** Real-time dashboards allow admins to track delayed or in-progress trips. When a vehicle needs repair, it is marked as "In Shop," automatically removing it from the available dispatch pool until maintenance is resolved.
3. **Role-Based Workflows:** The system strictly enforces roles. Drivers only see their tasks and self-service options, while Fleet Managers get a global overview of finances, personnel, and fleet health.

---

## Technology Stack

### Frontend

| Technology | Description |
|---|---|
| [React (Vite)](https://vitejs.dev/) | UI Framework |
| [React Router](https://reactrouter.com/) | Navigation |
| [@tanstack/react-query](https://tanstack.com/query/latest) | Server State Management & Data Fetching |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | Crisp, consistent iconography |
| [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) | Form handling and validation |

### Backend

| Technology | Description |
|---|---|
| [NestJS](https://nestjs.com/) | Progressive Node.js framework |
| [Prisma ORM](https://www.prisma.io/) | Next-generation Node.js and TypeScript ORM |
| [PostgreSQL](https://www.postgresql.org/) | Primary relational database |
| **JWT (JSON Web Tokens)** | Secure authentication and role validation |

---

## Key Features

### Role-Based Access Control (RBAC)
- **Administrators / Fleet Managers:** Full access to fleet utilization, vehicle management, trip dispatching, expense tracking, and maintenance logs.
- **Drivers:** Dedicated, restricted views focused strictly on their assigned trips, logging expenses, updating their availability status, and managing their credentials.

### Live Operations Dashboard
- **Real-Time Tracking:** Admins get a bird's-eye view of active vehicles, available fleets, and fleet utilization metrics.
- **Delay Detection:** Automated alerts flag assigned trips where the scheduled start time has passed but the driver hasn't begun the journey.
- **Dynamic Filtering:** Sort the live operations board by 'Delayed', 'In Progress', 'Completed', or 'Cancelled' statuses.

### Trip & Expense Management
- **Interactive Trip Lifecycle:** Trips flow sequentially from `DRAFT` ➔ `ASSIGNED` ➔ `READY_TO_START` ➔ `IN_PROGRESS` ➔ `COMPLETED`.
- **Driver Self-Service:** Drivers can accept trips, mark them as in-progress, and complete them directly from their dashboard.
- **Inline Expense Logging:** Drivers log toll, fuel, and miscellaneous expenses on a per-trip basis. Admins can view these toggled expense reports directly beneath each trip.

### Comprehensive Maintenance Hub
- **Lifecycle Tracking:** Vehicle repair requests move from `OPEN` ➔ `IN_PROGRESS` (In Shop) ➔ `COMPLETED`.
- **Automated Fleet Status:** Marking a vehicle as "In Shop" automatically removes it from the dispatch pool. Completing the repair makes the vehicle `AVAILABLE` again.
- **Cost Analytics:** Admins can input repair costs upon completion and track total maintenance expenditures over time.

### Driver Profiles & Self-Service
- **Inline Editing:** Drivers can update their contact and credential (license) information seamlessly using a pencil-icon inline editing system.
- **Duty Toggling:** Drivers can toggle themselves between `AVAILABLE` and `OFF_DUTY`, ensuring dispatchers know exactly who is ready for a trip.
- **Safety & Performance:** Visual safety score indicators and historical trip statistics are readily available on the profile page.

---

## Screenshots & Demos

Experience the seamless workflow and modern UI of TransitOps:

### Admin Login & Dashboard Overview (Video)
*(Click the link below if the video player does not load)*  
[Watch Admin Login Demo](./assets/adminLogin.mp4)

<video src="./assets/adminLogin.mp4" controls width="100%"></video>

### Trip Maker & Expense Workflow (Video)
*(Click the link below if the video player does not load)*  
[Watch Trip Maker Demo](./assets/TripMaker.mp4)

<video src="./assets/TripMaker.mp4" controls width="100%"></video>

### Authentication (Login & Signup)
![Login and Signup](./assets/loginandsignup.png)

### Live Operations Dashboard
![Admin Dashboard](./assets/adminDashboard.png)

### User Management
![Admin Users](./assets/adminUsers.png)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/transitops?schema=public"
   JWT_SECRET="your_super_secret_key"
   ```
4. Push the Prisma schema and seed the database:
   ```bash
   npx prisma db push
   ```
5. Start the backend server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.
