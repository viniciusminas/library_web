import { Outlet } from "react-router-dom";

export default function PessoasLayout() {
  return (
    <>
      <div className="container" style={{ paddingBottom: 0 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>Pessoas</h1>
          <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
            Gerencie os usuários da biblioteca.
          </p>
        </div>
      </div>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
