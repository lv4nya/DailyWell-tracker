import { Check, ChevronLeft, Coffee, Droplet, GlassWater, Leaf } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";

const drinkTypes = [
  { type: "water", label: "Water", icon: Droplet },
  { type: "tea", label: "Tea", icon: Leaf },
  { type: "coffee", label: "Coffee", icon: Coffee },
  { type: "other", label: "Other", icon: GlassWater }
];
const amountOptions = [100, 250, 500];
const bottleMarks = [2000, 1500, 1000, 500, 250];

function AddDrink() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: "water", amountMl: 250 });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedDrink = drinkTypes.find((drink) => drink.type === form.type) || drinkTypes[0];
  const SelectedIcon = selectedDrink.icon;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/water", {
        amountMl: form.amountMl,
        note: selectedDrink.label
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not log drink.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="add-drink-screen" onSubmit={handleSubmit}>
      <header className="add-drink-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <h1>Add Drink</h1>
      </header>

      <section className="drink-stage" aria-label={`${form.amountMl} ml selected`}>
        <div className="bottle-wrap">
          {bottleMarks.map((mark) => (
            <span className="ml-mark" key={mark}>
              {mark} ml
            </span>
          ))}
          <div className="bottle">
            <div className="bottle-cap" />
            <div className="bottle-neck" />
            <div className="water-fill" style={{ height: `${Math.min((form.amountMl / 2000) * 100, 100)}%` }} />
          </div>
        </div>
      </section>

      <section className="drink-selection-card">
        <div className="drink-selection-main">
          <div className="drink-badge">
            <SelectedIcon size={18} aria-hidden="true" />
          </div>
          <div>
            <span>{selectedDrink.label}</span>
            <strong>{form.amountMl} ml</strong>
          </div>
        </div>

        <div className="drink-type-row" aria-label="Drink type">
          {drinkTypes.map(({ type, label, icon: Icon }) => (
            <button
              className={form.type === type ? "type-chip active" : "type-chip"}
              key={type}
              type="button"
              onClick={() => setForm({ ...form, type })}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="amount-controls" aria-label="Amount controls">
          {amountOptions.map((amount) => (
            <button
              className={form.amountMl === amount ? "amount-chip active" : "amount-chip"}
              key={amount}
              type="button"
              onClick={() => setForm({ ...form, amountMl: amount })}
            >
              {amount} ml
            </button>
          ))}
        </div>
      </section>

      {message ? <p className="form-message">{message}</p> : null}

      <button className="confirm-drink-button" disabled={loading}>
        <span>{loading ? "Saving..." : "Confirm"}</span>
        <Check size={18} aria-hidden="true" />
      </button>
    </form>
  );
}

export default AddDrink;
