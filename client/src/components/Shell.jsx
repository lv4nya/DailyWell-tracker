import { UserRound } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav.jsx";

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

      <BottomNav />
    </div>
  );
}

export default Shell;
