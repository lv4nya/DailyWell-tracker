import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

function Analytics() {
  const [summary, setSummary] = useState({ totalMl: 0, dailyGoalMl: 2500, weekly: [] });
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    Promise.all([api.get("/water/today"), api.get("/goals")])
      .then(([waterResponse, goalsResponse]) => {
        const waterGoal = goalsResponse.data.find((goal) => goal.category === "water" && goal.status === "active");
        const todayLabel = new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date());

        setSummary({
          totalMl: waterResponse.data.totalMl,
          dailyGoalMl: Number(waterGoal?.targetValue || 2500),
          weekly: [{ dayLabel: todayLabel, totalMl: waterResponse.data.totalMl }]
        });
        setState({ loading: false, error: "" });
      })
      .catch(() => {
        setState({
          loading: false,
          error: "Unable to load analytics right now."
        });
      });
  }, []);

  const max = Math.max(...summary.weekly.map((item) => item.totalMl), summary.dailyGoalMl, 1);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p>Weekly view</p>
          <h2>{summary.totalMl} ml today</h2>
          <span>Goal line: {summary.dailyGoalMl} ml</span>
        </div>
        <BarChart3 size={44} aria-hidden="true" />
      </section>

      <section className="chart-card" aria-label="Weekly hydration chart">
        {state.loading ? <div className="status-banner">Loading analytics...</div> : null}
        {state.error ? <div className="status-banner error">{state.error}</div> : null}
        {!state.loading && !state.error && summary.totalMl === 0 ? (
          <div className="empty-state">
            <strong>No hydration logged today.</strong>
            <span>Add a drink to see your progress chart move.</span>
          </div>
        ) : null}
        {summary.weekly.map((item) => (
          <div className="bar-row" key={item.dayLabel}>
            <span>{item.dayLabel}</span>
            <div>
              <i style={{ width: `${Math.max((item.totalMl / max) * 100, 4)}%` }} />
            </div>
            <strong>{item.totalMl}</strong>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Analytics;
