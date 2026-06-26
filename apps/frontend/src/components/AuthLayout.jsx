import { Droplets } from "lucide-react";

function AuthLayout({ children, eyebrow, title, subtitle }) {
  return (
    <main className="auth-screen">
      <section className="brand-panel">
        <div className="brand-mark">
          <Droplets size={28} aria-hidden="true" />
        </div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </section>
      {children}
    </main>
  );
}

export default AuthLayout;
