import { Truck, UserCog, Route as RouteIcon, Wrench, AlertTriangle } from "lucide-react";
import "./Dashboard.css";

const STATS = [
  { label: "Active Vehicles", value: 42, icon: Truck, accent: "#5865f2" },
  { label: "Active Drivers", value: 37, icon: UserCog, accent: "#23a559" },
  { label: "Trips Today", value: 128, icon: RouteIcon, accent: "#faa61a" },
  { label: "Pending Maintenance", value: 5, icon: Wrench, accent: "#f23f42" },
];

const RECENT_TRIPS = [
  { id: "TRP-1042", driver: "Rohit Sharma", vehicle: "MH-12 AB 4521", status: "Completed" },
  { id: "TRP-1041", driver: "Ankit Verma", vehicle: "MH-14 CD 7788", status: "In Transit" },
  { id: "TRP-1040", driver: "Suresh Nair", vehicle: "MH-12 XY 1190", status: "Delayed" },
];

const statusColor: Record<string, string> = {
  Completed: "#23a559",
  "In Transit": "#5865f2",
  Delayed: "#f23f42",
};

export default function Dashboard() {
  return (
    <>
      <header className="ts-topbar">
        <h1>Dashboard</h1>
        <span className="ts-topbar-sub">Overview of your fleet operations</span>
      </header>

      <section className="ts-stats-grid">
        {STATS.map(({ label, value, icon: Icon, accent }) => (
          <div className="ts-card ts-stat-card" key={label}>
            <div className="ts-stat-icon" style={{ background: `${accent}22`, color: accent }}>
              <Icon size={20} />
            </div>
            <div>
              <div className="ts-stat-value">{value}</div>
              <div className="ts-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="ts-card ts-table-card">
        <div className="ts-card-header">
          <h2>Recent Trips</h2>
        </div>
        <table className="ts-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_TRIPS.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.driver}</td>
                <td>{t.vehicle}</td>
                <td>
                  <span
                    className="ts-badge"
                    style={{
                      color: statusColor[t.status],
                      background: `${statusColor[t.status]}22`,
                    }}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="ts-card ts-alert-card">
        <AlertTriangle size={18} color="#faa61a" />
        <span>3 vehicles are due for service this week.</span>
      </section>
    </>
  );
}