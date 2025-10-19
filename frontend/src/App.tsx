import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import MultasConsultar from "./features/multas/Consultar";

import PessoasLayout from "./features/pessoas/Layout";
import PessoasCadastrar from "./features/pessoas/cadastrar";
import PessoasConsultar from "./features/pessoas/consultar";

import LivrosLayout from "./features/livros/Layout";
import LivrosConsultar from "./features/livros/Consultar";
import LivrosCadastrar from "./features/livros/Cadastrar";

import ReservasLayout from "./features/reservas/Layout";
import ReservasConsultar from "./features/reservas/Consultar";

export default function App(){
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<div className="container"><Home/></div>} />

        {/* Pessoas */}
        <Route path="/pessoas" element={<PessoasLayout />}>
          <Route index element={<Navigate to="consultar" replace />} />
          <Route path="consultar" element={<PessoasConsultar />} />
          <Route path="cadastrar" element={<PessoasCadastrar />} />
        </Route>

        {/* Livros */}
        <Route path="/livros" element={<LivrosLayout />}>
          <Route index element={<LivrosConsultar />} />
          <Route path="consultar" element={<LivrosConsultar />} />
          <Route path="cadastrar" element={<LivrosCadastrar />} />
        </Route>

        {/* Reservas */}
        <Route path="/reservas" element={<ReservasLayout />}>
          <Route index element={<ReservasConsultar />} />
          <Route path="consultar" element={<ReservasConsultar />} />
          {/* Compat: se alguém acessar /reservas/cadastrar, redireciona */}
          <Route path="cadastrar" element={<Navigate to="/reservas/consultar" replace />} />
        </Route>

          <Route path="/multas" element={<div className="container"><MultasConsultar /></div>} />
      
      </Routes>
    </BrowserRouter>
  );
}
