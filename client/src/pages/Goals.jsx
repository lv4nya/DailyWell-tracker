import { Dumbbell, GlassWater, Plus, Salad, Sparkles, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import GoalCard from "../components/GoalCard.jsx";

const defaultCalorieGoal = 2000;

const defaultGoals = [
  {
    id: "daily-water",
    title: "Drink Water",
    category: "water",
    period: "daily",
    streak: 4,
    frequency: "2 Liter",
    progress: 72,
    tone: "blue",
    icon: GlassWater
  },
  {
    id: "weekly-fast-food",
    title: "Avoid Fast Food",
    category: "food",
    period: "weekly",
    streak: 62,
    frequency: "3 Times a Week or Less",
    progress: 68,
    tone: "green",
    icon: Salad
  },
  {
    id: "weekly-soft-drinks",
    title: "Reduce Soft Drinks",
    category: "water",
    period: "weekly",
    streak: 42,
    frequency: "2 Times a Week or Less",
    progress: 38,
    tone: "orange",
    icon: GlassWater
  },
  {
    id: "weekly-gain-weight",
    title: "Gain Weight",
    category: "wellness",
    period: "weekly",
    streak: 62,
    frequency: "Once a Week",
    progress: 78,
    tone: "violet",
    icon: Trophy
  }
];

const newGoals = [
  {
    title: "Start Exercising",
    category: "wellness",
    targetValue: 3,
    unit: "sessions",
    period: "weekly",
    tone: "workout",
    icon: Dumbbell
  },
  {
    title: "Low Carb Day",
    category: "food",
    targetValue: 1,
    unit: "day",
    period: "weekly",
    tone: "meal",
    icon: Salad
  },
  {
    title: "Take Vitamins",
    category: "medicine",
    targetValue: 1,
    unit: "dose",
    period: "daily",
    tone: "vitamin",
    icon: GlassWater
  }
];

const toneByCategory = {
  water: "blue",
  food: "green",
  medicine: "orange",
  fasting: "violet",
  wellness: "violet",
  other: "orange"
};

const iconByCategory = {
  water: GlassWater,
  food: Salad,
  medicine: Target,
  fasting: Sparkles,
  wellness: Trophy,
  other: Target
};

function formatFrequency(goal) {
  if (goal.unit && goal.targetValue) {
    return `${goal.targetValue} ${goal.unit}`;
  }

  if (goal.period === "weekly") {
    return "Once a Week";
  }

  return "Every Day";
}

function decorateGoal(goal, index) {
  const tone = toneByCategory[goal.category] || defaultGoals[index % defaultGoals.length].tone;
  const Icon = iconByCategory[goal.category] || Target;

  return {
    ...goal,
    tone,
    icon: Icon,
    streak: goal.streak || Math.max(1, 12 - index * 2),
    frequency: goal.frequency || formatFrequency(goal),
    progress: goal.progress || Math.max(34, 78 - index * 9)
  };
}

function isCalorieGoal(goal) {
  return (
    goal.category === "food" &&
    goal.period === "daily" &&
    goal.unit === "kcal" &&
    goal.title.toLowerCase().includes("calorie")
  );
}

function Goals() {
  const [savedGoals, setSavedGoals] = useState([]);
  const [message, setMessage] = useState("");
  const [savingTitle, setSavingTitle] = useState("");
  const [calorieGoal, setCalorieGoal] = useState(String(defaultCalorieGoal));
  const [calorieGoalId, setCalorieGoalId] = useState(null);
  const [calorieSaving, setCalorieSaving] = useState(false);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    api
      .get("/goals")
      .then(({ data }) => {
        const savedCalorieGoal = data.find(isCalorieGoal);

        setSavedGoals(data);
        setCalorieGoal(String(savedCalorieGoal?.targetValue || defaultCalorieGoal));
        setCalorieGoalId(savedCalorieGoal?.id || null);
        setState({ loading: false, error: "" });
      })
      .catch(() => {
        setState({
          loading: false,
          error: "Unable to load saved goals. Showing demo goals for now."
        });
      });
  }, []);

  const displayGoals = useMemo(() => {
    if (!savedGoals.length) {
      return defaultGoals;
    }

    const saved = savedGoals.filter((goal) => !isCalorieGoal(goal)).map(decorateGoal);
    const savedTitles = new Set(saved.map((goal) => goal.title.toLowerCase()));
    const fallback = defaultGoals.filter((goal) => !savedTitles.has(goal.title.toLowerCase()));

    return [...saved, ...fallback];
  }, [savedGoals]);

  const dailyGoals = displayGoals.filter((goal) => goal.period === "daily");
  const weeklyGoals = displayGoals.filter((goal) => goal.period === "weekly");

  async function addGoal(goal) {
    setMessage("");
    setSavingTitle(goal.title);

    try {
      const { data } = await api.post("/goals", {
        title: goal.title,
        category: goal.category,
        targetValue: goal.targetValue,
        unit: goal.unit,
        period: goal.period,
        status: "active"
      });

      setSavedGoals((current) => [...current, data]);
      setMessage(`${goal.title} added.`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add goal.");
    } finally {
      setSavingTitle("");
    }
  }

  async function saveCalorieGoal(event) {
    event.preventDefault();
    setMessage("");
    setCalorieSaving(true);

    const nextGoal = Number(calorieGoal);

    if (!nextGoal || nextGoal <= 0) {
      setMessage("Enter a calorie goal above 0.");
      setCalorieSaving(false);
      return;
    }

    const payload = {
      title: "Daily Calories",
      category: "food",
      targetValue: nextGoal,
      unit: "kcal",
      period: "daily",
      status: "active"
    };

    try {
      const { data } = calorieGoalId
        ? await api.put(`/goals/${calorieGoalId}`, payload)
        : await api.post("/goals", payload);

      setCalorieGoalId(data.id);
      setCalorieGoal(String(data.targetValue || nextGoal));
      setSavedGoals((current) => {
        const withoutCalorieGoal = current.filter((goal) => !isCalorieGoal(goal));
        return [...withoutCalorieGoal, data];
      });
      setMessage("Daily calorie goal saved.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save calorie goal.");
    } finally {
      setCalorieSaving(false);
    }
  }

  return (
    <div className="goals-screen">
      <header className="goals-header">
        <h1>Goals</h1>
        <button type="button" onClick={() => addGoal(newGoals[0])} aria-label="Add goal">
          <Plus size={18} aria-hidden="true" />
        </button>
      </header>

      {state.loading ? <div className="status-banner">Loading your goals...</div> : null}
      {state.error ? <div className="status-banner error">{state.error}</div> : null}
      {!state.loading && !state.error && !savedGoals.length ? (
        <div className="empty-state">
          <strong>Demo goals are ready.</strong>
          <span>Add a new goal to replace the sample set with your own routine.</span>
        </div>
      ) : null}

      <form className="calorie-goal-card" onSubmit={saveCalorieGoal}>
        <div>
          <span>Daily Calories</span>
          <strong>{Number(calorieGoal || defaultCalorieGoal)} kcal</strong>
        </div>
        <label>
          Goal
          <input
            type="number"
            min="1"
            step="50"
            value={calorieGoal}
            onChange={(event) => setCalorieGoal(event.target.value)}
          />
        </label>
        <button type="submit" disabled={calorieSaving}>
          {calorieSaving ? "Saving..." : "Save"}
        </button>
      </form>

      <section className="goals-panel" aria-label="Current goals">
        <span className="section-kicker">Daily</span>
        {dailyGoals.map((goal) => (
          <GoalCard goal={goal} key={goal.id} />
        ))}

        <span className="section-kicker">Weekly</span>
        {weeklyGoals.map((goal) => (
          <GoalCard goal={goal} key={goal.id} />
        ))}

        <span className="section-kicker">New Goals</span>
        <div className="new-goals">
          {newGoals.map((goal) => {
            const Icon = goal.icon;

            return (
              <article className={`new-goal ${goal.tone}`} key={goal.title}>
                <div aria-hidden="true">
                  <Icon size={28} />
                </div>
                <strong>{goal.title}</strong>
                <button
                  type="button"
                  onClick={() => addGoal(goal)}
                  disabled={savingTitle === goal.title}
                  aria-label={`Add ${goal.title}`}
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {message ? <p className="form-message">{message}</p> : null}
    </div>
  );
}

export default Goals;
