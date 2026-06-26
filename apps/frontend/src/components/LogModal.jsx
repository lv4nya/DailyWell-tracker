import { X } from "lucide-react";

function LogModal({ children, icon, title, tone = "mint", onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`log-modal ${tone}`} role="dialog" aria-modal="true" aria-labelledby="log-modal-title">
        <header className="log-modal-header">
          <div className="log-modal-title">
            <span>{icon}</span>
            <h2 id="log-modal-title">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default LogModal;
