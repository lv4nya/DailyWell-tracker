function GoalCard({ goal }) {
  const Icon = goal.icon;

  return (
    <article className="goal-row">
      <div className={`goal-icon ${goal.tone}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <strong>{goal.title}</strong>
        <span>Streak {goal.streak}</span>
        <small>{goal.frequency}</small>
      </div>
      <i className={`goal-ring ${goal.tone}`} style={{ "--goal-progress": `${goal.progress}%` }} />
    </article>
  );
}

export default GoalCard;
