import { Outlet, NavLink } from "react-router-dom";

export default function ReservasLayout(){
  return (
    <div className="container">
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Reservas</h2>
        <p style={{ marginTop: 8 }}>
          Consulte e gerencie as reservas. Para criar uma nova, acesse a página de{" "}
          <NavLink to="/livros" className="navlink">Livros</NavLink> e use o botão <strong>Reservar</strong>.
        </p>
      </section>

      <Outlet />
    </div>
  );
}