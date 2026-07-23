import "./GlassCard.css";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`vm-glass-card ${className}`}>
      {children}
    </div>
  );
}

export default GlassCard;