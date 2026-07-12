# TransitOps 🚚

**TransitOps** is an intelligent, end-to-end Fleet and Transport Management platform designed to streamline logistics, vehicle maintenance, and driver operations. Built with a robust backend and a highly interactive, modern frontend, it bridges the gap between administrative oversight and driver execution.

---

## 🌟 Key Features

### 🔐 Role-Based Access Control (RBAC)
- **Administrators / Fleet Managers:** Full access to fleet utilization, vehicle management, trip dispatching, expense tracking, and maintenance logs.
- **Drivers:** Dedicated, restricted views focused strictly on their assigned trips, logging expenses, updating their availability status, and managing their credentials.

### 📊 Live Operations Dashboard
- **Real-Time Tracking:** Admins get a bird's-eye view of active vehicles, available fleets, and fleet utilization metrics.
- **Delay Detection:** Automated alerts flag assigned trips where the scheduled start time has passed but the driver hasn't begun the journey.
- **Dynamic Filtering:** Sort the live operations board by 'Delayed', 'In Progress', 'Completed', or 'Cancelled' statuses.

### 🛣️ Trip & Expense Management
- **Interactive Trip Lifecycle:** Trips flow sequentially from `DRAFT` ➔ `ASSIGNED` ➔ `READY_TO_START` ➔ `IN_PROGRESS` ➔ `COMPLETED`.
- **Driver Self-Service:** Drivers can accept trips, mark them as in-progress, and complete them directly from their dashboard.
- **Inline Expense Logging:** Drivers log toll, fuel, and miscellaneous expenses on a per-trip basis. Admins can view these toggled expense reports directly beneath each trip.

### 🔧 Comprehensive Maintenance Hub
- **Lifecycle Tracking:** Vehicle repair requests move from `OPEN` ➔ `IN_PROGRESS` (In Shop) ➔ `COMPLETED`.
- **Automated Fleet Status:** Marking a vehicle as "In Shop" automatically removes it from the dispatch pool. Completing the repair makes the vehicle `AVAILABLE` again.
- **Cost Analytics:** Admins can input repair costs upon completion and track total maintenance expenditures over time.

### 👤 Driver Profiles & Self-Service
- **Inline Editing:** Drivers can update their contact and credential (license) information seamlessly using a pencil-icon inline editing system.
- **Duty Toggling:** Drivers can toggle themselves between `AVAILABLE` and `OFF_DUTY`, ensuring dispatchers know exactly who is ready for a trip.
- **Safety & Performance:** Visual safety score indicators and historical trip statistics are readily available on the profile page.

---

## 📸 Screenshots

*(Add your screenshots to a `docs/` folder and name them as follows)*

### Live Operations Dashboard
![Dashboard](docs/dashboard.png)

### Maintenance Hub
![Maintenance Hub](docs/maintenance.png)

### Driver Profile & Settings
![Driver Profile](docs/profile.png)

---

## 🎨 UI/UX Design Philosophy

TransitOps breaks away from generic enterprise dashboards by utilizing a **"Discord-inspired"** dark aesthetic. 
- **Palette:** Rich zincs/greys (`#1e1f22`, `#2b2d31`, `#313338`) combined with high-contrast, transport-oriented accents (Blurple, Green, Yellow, Red).
- **Typography:** Large, legible fonts prioritizing readability.
- **Micro-interactions:** Responsive hover scales, shadow blooms, glowing badges, and smooth slide-in animations ensure the platform feels alive, snappy, and premium.

---

## 🛠️ Technology Stack

**Frontend:**
- [React (Vite)](https://vitejs.dev/) - UI Framework
- [React Router](https://reactrouter.com/) - Navigation
- [@tanstack/react-query](https://tanstack.com/query/latest) - Server State Management & Data Fetching
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling (customized to the TransitOps palette)
- [Lucide React](https://lucide.dev/) - Crisp, consistent iconography
- [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) - Form handling and validation

**Backend:**
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma ORM](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM
- [PostgreSQL](https://www.postgresql.org/) - Primary relational database
- **JWT (JSON Web Tokens)** - Secure authentication and role validation

---

## 🚀 Getting Started

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
