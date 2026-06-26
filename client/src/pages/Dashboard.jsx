import { Apple, Check, Coffee, Droplets, Flame, MoreHorizontal, Pill, Plus, Utensils } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios.js";
import LogModal from "../components/LogModal.jsx";

const foodRows = [
  { label: "Breakfast", mealType: "breakfast", icon: Apple },
  { label: "Lunch", mealType: "lunch", icon: Utensils },
  { label: "Dinner", mealType: "dinner", icon: Utensils }
];

const defaultForms = {
  water: { amountMl: 250, customAmount: "", drinkType: "Water" },
  food: { mealType: "breakfast", foodName: "", calories: "", note: "" },
  snack: { foodName: "", calories: "", note: "" },
  medicine: { name: "", dosage: "", status: "taken", note: "" },
  fasting: { note: "" }
};

const waterAmounts = [100, 250, 500];
const drinkTypes = ["Water", "Juice", "Coffee", "Tea", "Soft Drink"];

function buildMealPreviews(logs) {
  return logs.reduce(
    (acc, log) => {
      const key = log.mealType || "other";

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(log);
      return acc;
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] }
  );
}

function previewText(items) {
  if (!items?.length) {
    return "No items yet";
  }

  const names = items.slice(0, 2).map((item) => item.foodName).join(", ");
  const extra = items.length > 2 ? ` +${items.length - 2} more` : "";

  return `${names}${extra}`;
}

function Dashboard() {
  const [summary, setSummary] = useState({
    totalMl: 0,
    drinkCount: 0,
    dailyGoalMl: 2500,
    streakDays: 0,
    foodCount: 0,
    totalCalories: 0,
    calorieGoal: 2000,
    medicineCount: 0,
    supplementTarget: 3,
    fastingActive: false
  });
  const [mealPreviews, setMealPreviews] = useState({ breakfast: [], lunch: [], dinner: [], snack: [] });
  const [activeFastingSession, setActiveFastingSession] = useState(null);
  const [modal, setModal] = useState(null);
  const [forms, setForms] = useState(defaultForms);
  const [message, setMessage] = useState("");
  const [dashboardState, setDashboardState] = useState({ loading: true, error: "" });
  const [saving, setSaving] = useState(false);

  const refreshDashboard = useCallback(() => {
    setDashboardState((current) => ({ ...current, loading: true, error: "" }));

    Promise.all([
      api.get("/water/today"),
      api.get("/food/today"),
      api.get("/medicines/status"),
      api.get("/medicines/supplements/progress"),
      api.get("/fasting/history"),
      api.get("/goals")
    ])
      .then(([waterResponse, foodResponse, medicineResponse, supplementResponse, fastingResponse, goalsResponse]) => {
        const waterGoal = goalsResponse.data.find((goal) => goal.category === "water" && goal.status === "active");
        const calorieGoal = goalsResponse.data.find(
          (goal) =>
            goal.category === "food" &&
            goal.period === "daily" &&
            goal.status === "active" &&
            goal.unit === "kcal"
        );
        const activeSession = fastingResponse.data.find((session) => session.status === "active");
        const groupedFood = buildMealPreviews(foodResponse.data.logs);

        setActiveFastingSession(activeSession || null);
        setMealPreviews(groupedFood);
        setSummary({
          totalMl: waterResponse.data.totalMl,
          drinkCount: waterResponse.data.logs.length,
          dailyGoalMl: Number(waterGoal?.targetValue || 2500),
          streakDays: waterResponse.data.logs.length ? 1 : 0,
          foodCount: foodResponse.data.logs.length,
          totalCalories: Number(foodResponse.data.totalCalories || 0),
          calorieGoal: Number(calorieGoal?.targetValue || 2000),
          medicineCount: supplementResponse.data.completed ?? medicineResponse.data.length,
          supplementTarget: supplementResponse.data.target || 3,
          fastingActive: Boolean(activeSession)
        });
        setDashboardState({ loading: false, error: "" });
      })
      .catch(() => {
        setDashboardState({
          loading: false,
          error: "Unable to load dashboard data. You can still open the logging cards."
        });
      });
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  function openFoodModal(mealType) {
    setMessage("");
    setForms((current) => ({ ...current, food: { ...defaultForms.food, mealType } }));
    setModal("food");
  }

  function openModal(type) {
    setMessage("");
    setForms((current) => ({ ...current, [type]: { ...defaultForms[type] } }));
    setModal(type);
  }

  function updateForm(type, field, value) {
    setForms((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [field]: value
      }
    }));
  }

  async function saveWater(amountMl, drinkType = "Water") {
    setSaving(true);
    setMessage("");

    try {
      await api.post("/water", {
        amountMl,
        note: drinkType
      });
      setModal(null);
      refreshDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save water log.");
    } finally {
      setSaving(false);
    }
  }

  function saveCustomWater(event) {
    event.preventDefault();
    const amount = Number(forms.water.customAmount || forms.water.amountMl);

    if (!amount || amount <= 0) {
      setMessage("Enter a positive water amount.");
      return;
    }

    saveWater(amount, forms.water.drinkType);
  }

  async function completeSupplement() {
    if (summary.medicineCount >= summary.supplementTarget) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await api.post("/medicines/supplements/complete");
      refreshDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not complete supplement.");
    } finally {
      setSaving(false);
    }
  }

  async function saveFoodLog(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await api.post("/food", {
        ...forms.food,
        calories: forms.food.calories ? Number(forms.food.calories) : null
      });
      setModal(null);
      refreshDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save food log.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSnackLog(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await api.post("/food", {
        mealType: "snack",
        foodName: forms.snack.foodName,
        calories: forms.snack.calories ? Number(forms.snack.calories) : null,
        note: forms.snack.note
      });
      setModal(null);
      refreshDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save snack log.");
    } finally {
      setSaving(false);
    }
  }

  async function saveMedicineLog(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { data: medicine } = await api.post("/medicines", {
        name: forms.medicine.name,
        dosage: forms.medicine.dosage,
        notes: forms.medicine.note
      });

      await api.post("/medicines/logs", {
        medicineId: medicine.id,
        status: forms.medicine.status,
        note: forms.medicine.note
      });
      setModal(null);
      refreshDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save supplement log.");
    } finally {
      setSaving(false);
    }
  }

  async function saveFastingLog(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (activeFastingSession) {
        await api.patch(`/fasting/${activeFastingSession.id}/end`, { note: forms.fasting.note });
      } else {
        await api.post("/fasting/start", { note: forms.fasting.note });
      }

      setModal(null);
      refreshDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update fasting session.");
    } finally {
      setSaving(false);
    }
  }

  const progress = Math.min(Math.round((summary.totalMl / summary.dailyGoalMl) * 100), 100) || 0;
  const caloriePercent = summary.calorieGoal ? Math.round((summary.totalCalories / summary.calorieGoal) * 100) : 0;
  const calorieBarWidth = Math.min(caloriePercent, 100);
  const caloriesExceeded = summary.totalCalories > summary.calorieGoal;
  const supplementsComplete = summary.medicineCount >= summary.supplementTarget;
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "short"
  }).format(new Date());
  const storedUser = JSON.parse(localStorage.getItem("dailywell_user") || "null");
  const name = storedUser?.name || "Jack";

  return (
    <div className="dashboard-screen">
      <header className="dashboard-greeting">
        <div>
          <span>Hello, {name},</span>
          <strong>Today, {today}</strong>
        </div>
      </header>

      {dashboardState.loading ? <div className="status-banner">Loading today&apos;s wellness snapshot...</div> : null}
      {dashboardState.error ? <div className="status-banner error">{dashboardState.error}</div> : null}

      <section className="dashboard-board" aria-label="Daily wellness cards">
        <article className="dashboard-card drink-card">
          <div className="card-title">
            <Droplets size={15} aria-hidden="true" />
            <span>Drink</span>
          </div>
          <div className="drink-meter">
            <strong>{summary.totalMl}</strong>
            <span>ml</span>
          </div>
          {!summary.drinkCount && !dashboardState.loading ? <small>No water logged yet</small> : null}
          <button
            className="quick-water-button"
            type="button"
            onClick={() => saveWater(250, "Water")}
            disabled={saving}
            aria-label="Quick add 250 ml water"
          >
            +250
          </button>
          <button className="card-plus" type="button" onClick={() => openModal("water")} aria-label="Water options">
            <MoreHorizontal size={18} aria-hidden="true" />
          </button>
        </article>

        <article className="dashboard-card food-card">
          {foodRows.map(({ label, mealType, icon: Icon }) => (
            <div className="food-row" key={label}>
              <span>
                <Icon size={15} aria-hidden="true" />
                <b>{label}</b>
                <small>{previewText(mealPreviews[mealType])}</small>
              </span>
              <button type="button" onClick={() => openFoodModal(mealType)} aria-label={`Add ${label}`}>
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </article>

        <article className={`dashboard-card medicine-card ${supplementsComplete ? "completed" : ""}`}>
          <div className="card-title">
            <Pill size={15} aria-hidden="true" />
            <span>Supplement</span>
          </div>
          <strong>{summary.medicineCount}/{summary.supplementTarget} completed</strong>
          {supplementsComplete ? <small className="completed-label">All done</small> : null}
          <button
            className="card-plus"
            type="button"
            onClick={completeSupplement}
            disabled={saving || supplementsComplete}
            aria-label="Complete supplement"
          >
            {supplementsComplete ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
          </button>
        </article>

        <article className="dashboard-card fasting-card">
          <div className="card-title">
            <Flame size={15} aria-hidden="true" />
            <span>Fasting</span>
          </div>
          <strong>{summary.fastingActive ? "Active" : "Start"}</strong>
          <button className="card-plus" type="button" onClick={() => openModal("fasting")} aria-label="Add fasting">
            <Plus size={18} aria-hidden="true" />
          </button>
        </article>

        <article className="dashboard-card snacks-card">
          <div className="card-title">
            <Coffee size={15} aria-hidden="true" />
            <span>Snacks</span>
          </div>
          <strong>{previewText(mealPreviews.snack)}</strong>
          <button className="card-plus" type="button" onClick={() => openModal("snack")} aria-label="Add snacks">
            <Plus size={18} aria-hidden="true" />
          </button>
        </article>
      </section>

      <article className="dashboard-summary">
        <div>
          <span>Water goal</span>
          <strong>{progress}% complete</strong>
        </div>
        <div className="progress-ring small" style={{ "--progress": `${progress}%` }}>
          <strong>{progress}</strong>
        </div>
      </article>

      <article className={`calorie-summary ${caloriesExceeded ? "warning" : ""}`}>
        <div className="calorie-summary-header">
          <div>
            <span>Calories</span>
            <strong>{summary.totalCalories} / {summary.calorieGoal} kcal</strong>
          </div>
          {caloriesExceeded ? <small>Goal exceeded</small> : null}
        </div>
        <div className="calorie-track">
          <i style={{ width: `${calorieBarWidth}%` }} />
        </div>
      </article>

      {modal === "water" ? (
        <LogModal title="Water Options" tone="blue" icon={<Droplets size={18} aria-hidden="true" />} onClose={() => setModal(null)}>
          <form className="log-modal-form" onSubmit={saveCustomWater}>
            <label>
              Drink type
              <select value={forms.water.drinkType} onChange={(event) => updateForm("water", "drinkType", event.target.value)}>
                {drinkTypes.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <div className="water-option-grid" aria-label="Water amount options">
              {waterAmounts.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  disabled={saving}
                  onClick={() => saveWater(amount, forms.water.drinkType)}
                >
                  Add {amount} ml
                </button>
              ))}
            </div>
            <label>
              Custom amount
              <input
                type="number"
                min="1"
                value={forms.water.customAmount}
                onChange={(event) => updateForm("water", "customAmount", event.target.value)}
                placeholder="Enter ml"
              />
            </label>
            {message ? <p className="form-error">{message}</p> : null}
            <button className="modal-save-button" disabled={saving}>{saving ? "Saving..." : "Add custom amount"}</button>
          </form>
        </LogModal>
      ) : null}

      {modal === "food" ? (
        <LogModal title="Food Log" tone="lime" icon={<Utensils size={18} aria-hidden="true" />} onClose={() => setModal(null)}>
          <form className="log-modal-form" onSubmit={saveFoodLog}>
            <label>
              Meal
              <select value={forms.food.mealType} onChange={(event) => updateForm("food", "mealType", event.target.value)}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Food
              <input value={forms.food.foodName} onChange={(event) => updateForm("food", "foodName", event.target.value)} placeholder="Oats, salad, rice..." required />
            </label>
            <label>
              Calories
              <input type="number" min="0" value={forms.food.calories} onChange={(event) => updateForm("food", "calories", event.target.value)} placeholder="Optional" />
            </label>
            <label>
              Note
              <textarea rows="3" value={forms.food.note} onChange={(event) => updateForm("food", "note", event.target.value)} placeholder="Optional" />
            </label>
            {message ? <p className="form-error">{message}</p> : null}
            <button className="modal-save-button" disabled={saving}>{saving ? "Saving..." : "Save food"}</button>
          </form>
        </LogModal>
      ) : null}

      {modal === "medicine" ? (
        <LogModal title="Supplement Log" tone="gold" icon={<Pill size={18} aria-hidden="true" />} onClose={() => setModal(null)}>
          <form className="log-modal-form" onSubmit={saveMedicineLog}>
            <label>
              Name
              <input value={forms.medicine.name} onChange={(event) => updateForm("medicine", "name", event.target.value)} placeholder="Vitamin D, omega 3..." required />
            </label>
            <label>
              Dosage
              <input value={forms.medicine.dosage} onChange={(event) => updateForm("medicine", "dosage", event.target.value)} placeholder="1 tablet, 500 mg..." />
            </label>
            <label>
              Status
              <select value={forms.medicine.status} onChange={(event) => updateForm("medicine", "status", event.target.value)}>
                <option value="taken">Taken</option>
                <option value="skipped">Skipped</option>
                <option value="missed">Missed</option>
              </select>
            </label>
            <label>
              Note
              <textarea rows="3" value={forms.medicine.note} onChange={(event) => updateForm("medicine", "note", event.target.value)} placeholder="Optional" />
            </label>
            {message ? <p className="form-error">{message}</p> : null}
            <button className="modal-save-button" disabled={saving}>{saving ? "Saving..." : "Save supplement"}</button>
          </form>
        </LogModal>
      ) : null}

      {modal === "fasting" ? (
        <LogModal title={activeFastingSession ? "End Fasting" : "Start Fasting"} tone="peach" icon={<Flame size={18} aria-hidden="true" />} onClose={() => setModal(null)}>
          <form className="log-modal-form" onSubmit={saveFastingLog}>
            <p className="modal-helper">
              {activeFastingSession ? "Finish your current fasting session." : "Start a new fasting session now."}
            </p>
            <label>
              Note
              <textarea rows="3" value={forms.fasting.note} onChange={(event) => updateForm("fasting", "note", event.target.value)} placeholder="Optional" />
            </label>
            {message ? <p className="form-error">{message}</p> : null}
            <button className="modal-save-button" disabled={saving}>
              {saving ? "Saving..." : activeFastingSession ? "End fasting" : "Start fasting"}
            </button>
          </form>
        </LogModal>
      ) : null}

      {modal === "snack" ? (
        <LogModal title="Snack Log" tone="violet" icon={<Coffee size={18} aria-hidden="true" />} onClose={() => setModal(null)}>
          <form className="log-modal-form" onSubmit={saveSnackLog}>
            <label>
              Snack
              <input value={forms.snack.foodName} onChange={(event) => updateForm("snack", "foodName", event.target.value)} placeholder="Fruit, nuts, yogurt..." required />
            </label>
            <label>
              Calories
              <input type="number" min="0" value={forms.snack.calories} onChange={(event) => updateForm("snack", "calories", event.target.value)} placeholder="Optional" />
            </label>
            <label>
              Note
              <textarea rows="3" value={forms.snack.note} onChange={(event) => updateForm("snack", "note", event.target.value)} placeholder="Optional" />
            </label>
            {message ? <p className="form-error">{message}</p> : null}
            <button className="modal-save-button" disabled={saving}>{saving ? "Saving..." : "Save snack"}</button>
          </form>
        </LogModal>
      ) : null}
    </div>
  );
}

export default Dashboard;
