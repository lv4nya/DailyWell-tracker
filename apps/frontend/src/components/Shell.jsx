import { Home, LineChart, Plus, Target, UserRound } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const routeTitles = {
  "/dashboard": "Today",
  "/add-drink": "Add Drink",
  "/goals": "Goals",
  "/analytics": "Analytics"
};

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const showTopbar = location.pathname === "/analytics";

  function handleLogout() {
    localStorage.removeItem("dailywell_token");
    localStorage.removeItem("dailywell_user");
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      {showTopbar ? (
        <header className="topbar">
          <div>
            <p>DailyWell</p>
            <h1>{routeTitles[location.pathname] || "Tracker"}</h1>
          </div>
          <button className="icon-button" onClick={handleLogout} aria-label="Log out">
            <UserRound size={20} aria-hidden="true" />
          </button>
        </header>
      ) : null}

      <section className="content">
        <Outlet />
      </section>

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
    </div>
  );
}

export default Shell;
