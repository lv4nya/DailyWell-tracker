import { Home, LineChart, Plus, Target } from "lucide-react";
import { NavLink } from "react-router-dom";

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <NavLink to="/dashboard">
        <Home size={20} aria-hidden="true" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/add-drink">
        <Plus size={20} aria-hidden="true" />
        <span>Add</span>
      </NavLink>
      <NavLink to="/goals">
        <Target size={20} aria-hidden="true" />
        <span>Goals</span>
      </NavLink>
      <NavLink to="/analytics">
        <LineChart size={20} aria-hidden="true" />
        <span>Stats</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
