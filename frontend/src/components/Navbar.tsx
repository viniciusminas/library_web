import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const location = useLocation();

  // Pessoas
  const [openPessoas, setOpenPessoas] = useState(false);
  const pessoasRef = useRef<HTMLDivElement>(null);
  const isPessoasActive = location.pathname.startsWith("/pessoas");

  // Livros
  const [openLivros, setOpenLivros] = useState(false);
  const livrosRef = useRef<HTMLDivElement>(null);
  const isLivrosActive = location.pathname.startsWith("/livros");

  // Fecha menus quando trocar de rota
  useEffect(() => {
    setOpenPessoas(false);
    setOpenLivros(false);
  }, [location.pathname]);

  // Fecha ao clicar fora ou pressionar ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (pessoasRef.current && !pessoasRef.current.contains(e.target as Node)) {
        setOpenPessoas(false);
      }
      if (livrosRef.current && !livrosRef.current.contains(e.target as Node)) {
        setOpenLivros(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenPessoas(false);
        setOpenLivros(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `navlink${isActive ? " active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-badge" />
          <span>Raccoon Books</span>
        </div>

        <nav className="navlinks">
          {/* Início */}
          <NavLink to="/" className={linkClass}>
            <span className="nav-ico" aria-hidden>🏠</span>
            <span className="nav-label">Início</span>
          </NavLink>

          {/* ===== Pessoas (dropdown) ===== */}
          <div className={`dropdown${openPessoas ? " open" : ""}`} ref={pessoasRef}>
            <button
              type="button"
              className={`navlink${isPessoasActive ? " active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={openPessoas}
              onClick={() => setOpenPessoas(v => !v)}
            >
              <span className="nav-ico" aria-hidden>👤</span>
              <span className="nav-label">Pessoas</span>
            </button>
            <div className="dropdown-menu" role="menu">
              <NavLink
                to="/pessoas/consultar"
                className="dropdown-item"
                onClick={() => setOpenPessoas(false)}
              >
                Consultar usuários
              </NavLink>
              <NavLink
                to="/pessoas/cadastrar"
                className="dropdown-item"
                onClick={() => setOpenPessoas(false)}
              >
                Cadastrar usuário
              </NavLink>
            </div>
          </div>

          {/* ===== Livros (dropdown) ===== */}
          <div className={`dropdown${openLivros ? " open" : ""}`} ref={livrosRef}>
            <button
              type="button"
              className={`navlink${isLivrosActive ? " active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={openLivros}
              onClick={() => setOpenLivros(v => !v)}
            >
              <span className="nav-ico" aria-hidden>📚</span>
              <span className="nav-label">Livros</span>
            </button>
            <div className="dropdown-menu" role="menu">
              <NavLink
                to="/livros/consultar"
                className="dropdown-item"
                onClick={() => setOpenLivros(false)}
              >
                Consultar acervo
              </NavLink>
              <NavLink
                to="/livros/cadastrar"
                className="dropdown-item"
                onClick={() => setOpenLivros(false)}
              >
                Cadastrar livro
              </NavLink>
            </div>
          </div>

          {/* Reservas */}
          <NavLink to="/reservas" className={linkClass}>
            <span className="nav-ico" aria-hidden>🗓️</span>
            <span className="nav-label">Reservas</span>
          </NavLink>

          {/* Multas */}
          <NavLink to="/multas" className={linkClass}>
            <span className="nav-ico" aria-hidden>💸</span>
            <span className="nav-label">Multas</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
