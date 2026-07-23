import "./StatCard.css";

export default function StatCard({ icon, label, value, tint = "primary", suffix = "" }) {
  return (
    <div className={`admx-stat-card admx-glass admx-stat-${tint}`}>
      <div className="admx-stat-icon">{icon}</div>
      <div className="admx-stat-text">
        <span className="admx-stat-value">{value}{suffix}</span>
        <span className="admx-stat-label">{label}</span>
      </div>
    </div>
  );
}
