import { Plus } from "lucide-react";

function HabitCard({ children, className = "", icon, label, onAdd, value }) {
  return (
    <article className={`dashboard-card ${className}`}>
      <div className="card-title">
        {icon}
        <span>{label}</span>
      </div>
      {children || <strong>{value}</strong>}
      {onAdd ? (
        <button className="card-plus" type="button" onClick={onAdd} aria-label={`Add ${label}`}>
          <Plus size={18} aria-hidden="true" />
        </button>
      ) : null}
    </article>
  );
}

export default HabitCard;
