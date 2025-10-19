import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Livro } from "../../types/Livro";
import * as LivrosAPI from "../../services/livros";
import * as PessoasAPI from "../../services/pessoas";
import * as ReservasAPI from "../../services/reservas";

type PessoaPick = { id: number; nome: string };

// --- helper simples para traduzir códigos HTTP em mensagens
function httpStatusMessage(status?: number, fallback = "Erro ao processar.") {
  switch (status) {
    case 409: return "Operação não permitida (conflito).";
    case 404: return "Recurso não encontrado.";
    case 400: return "Dados inválidos.";
    case 500: return "Falha no servidor. Verifique as regras/duplicidade da reserva.";
    case 0:   return "Falha de conexão com o servidor.";
    default:  return fallback;
  }
}

export default function LivrosConsultar() {
  const navigate = useNavigate();

  // lista/filters
  const [lista, setLista] = useState<Livro[]>([]);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroAutor, setFiltroAutor] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [loading, setLoading] = useState(true);

  // reservas abertas (somente no front): conjunto de livroId => reservado
  const [reservadosSet, setReservadosSet] = useState<Set<number>>(new Set());

  // mapa auxiliar: livroId -> { id: pessoaId, nome: pessoaNome } (quem reservou)
  const [reservadoPor, setReservadoPor] =
    useState<Record<number, { id: number; nome: string }>>({});

  // modal de reserva
  const [openModal, setOpenModal] = useState(false);
  const [alvoLivro, setAlvoLivro] = useState<Livro | null>(null);
  const [pessoas, setPessoas] = useState<PessoaPick[]>([]);
  const [selPessoa, setSelPessoa] = useState<string>(""); // guarda o id em string
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function carregar() {
    setLoading(true);
    try {
      // Carrega livros e reservas em paralelo
      const [livros, reservas] = await Promise.all([
        LivrosAPI.listarLivros(),
        ReservasAPI.listar(),
      ]);

      // Monta um Set com IDs de livros que têm reserva ABERTA (dataFim null/undefined)
      // e um mapa com o "dono" da reserva para UX/mensagens
      const s = new Set<number>();
      const dono: Record<number, { id: number; nome: string }> = {};

      for (const r of reservas as any[]) {
        const livroId = Number(r?.livro?.id ?? 0);
        const pessoaId = Number(r?.pessoa?.id ?? 0);
        const pessoaNome = String(r?.pessoa?.nome ?? "");
        if (livroId && !r?.dataFim) {
          s.add(livroId);
          if (pessoaId) dono[livroId] = { id: pessoaId, nome: pessoaNome };
        }
      }

      setLista(livros);
      setReservadosSet(s);
      setReservadoPor(dono);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void carregar();
  }, []);

  // filtros
  const filtrada = useMemo(() => {
    let base = [...lista];
    const t = filtroTitulo.trim().toLowerCase();
    const a = filtroAutor.trim().toLowerCase();
    const y = filtroAno.trim();

    if (t) base = base.filter((l) => (l.titulo ?? "").toLowerCase().includes(t));
    if (a) base = base.filter((l) => (l.autor ?? "").toLowerCase().includes(a));
    if (y) base = base.filter((l) => String(l.ano ?? "").includes(y));
    return base;
  }, [lista, filtroTitulo, filtroAutor, filtroAno]);

  // --- reservar: abre modal e carrega pessoas
  async function abrirModalReserva(l: Livro) {
    try {
      setMsg("");
      setSaving(false);
      setSelPessoa("");
      setAlvoLivro(l);
      setOpenModal(true);

      // Carrega pessoas (nomes) p/ o select
      const data = await PessoasAPI.listar();
      const picks = (data ?? [])
        .map((p: any) => ({ id: Number(p.id), nome: String(p.nome ?? "") }))
        .filter((p) => !!p.id && p.nome.length > 0);
      setPessoas(picks);
    } catch (e: any) {
      const err =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e?.message ||
        "Falha ao carregar pessoas.";
      alert(err);
      setOpenModal(false);
    }
  }

  // --- confirmar criação da reserva
  async function confirmarReserva() {
    if (!alvoLivro) return;

    const pessoaIdNum = Number(selPessoa);
    if (!pessoaIdNum) {
      setMsg("Selecione uma pessoa.");
      return;
    }

    try {
      setSaving(true);
      setMsg("");

      await ReservasAPI.criarReserva({
        pessoaId: pessoaIdNum,
        livroId: Number(alvoLivro.id),
      });

      setMsg("Reserva criada com sucesso!");
      // Recarrega para refletir "reservado" na tabela via Set e o "dono" no mapa
      await carregar();
      // fecha o modal depois de ~0.7s só para o usuário ver a mensagem
      setTimeout(() => setOpenModal(false), 700);
    } catch (e: any) {
      // Traduz status + usa mensagem do backend quando houver
      const status: number = e?.response?.status ?? 0;
      const backendMsg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        "Erro ao reservar.";

      let msgAmigavel = httpStatusMessage(status, backendMsg);

      // Personaliza 409 com o nome de quem já reservou, se soubermos
      if (status === 409 && alvoLivro?.id) {
        const dono = reservadoPor[Number(alvoLivro.id)];
        if (dono?.nome) {
          msgAmigavel = `Operação não permitida: livro já reservado.`;
        }
      }

      setMsg(msgAmigavel);
    } finally {
      setSaving(false);
    }
  }

  function fecharModal() {
    setOpenModal(false);
    setMsg("");
    setSelPessoa("");
    setAlvoLivro(null);
  }

  // excluir livro
  async function excluir(l: Livro) {
    if (!window.confirm(`Excluir o livro "${l.titulo}"?`)) return;
    await LivrosAPI.excluirLivro(Number(l.id));
    await carregar();
  }

  // fecha modal com ESC
  useEffect(() => {
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") fecharModal();
    }
    if (openModal) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [openModal]);

  return (
    <div className="card">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 180px auto",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <input
          className="input"
          placeholder="Filtrar por título"
          value={filtroTitulo}
          onChange={(e) => setFiltroTitulo(e.target.value)}
        />
        <input
          className="input"
          placeholder="Filtrar por autor"
          value={filtroAutor}
          onChange={(e) => setFiltroAutor(e.target.value)}
        />
        <input
          className="input"
          placeholder="Ano (ex.: 2020)"
          value={filtroAno}
          onChange={(e) => setFiltroAno(e.target.value)}
        />
        <button
          className="btn btn-ghost"
          onClick={() => {
            setFiltroTitulo("");
            setFiltroAutor("");
            setFiltroAno("");
          }}
        >
          Limpar
        </button>
      </div>

      {loading ? (
        <p>Carregando…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Ano</th>
              <th>Reserva</th>
              <th style={{ width: 260 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrada.map((l) => {
              const idNum = Number(l.id);
              // status derivado no front: se vier true do backend OU existe reserva aberta no Set
              const reservado = Boolean(l.reservado) || reservadosSet.has(idNum);
              const dono = reservadoPor[idNum];

              return (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.titulo}</td>
                  <td>{l.autor}</td>
                  <td>{l.ano}</td>
                  <td>{reservado ? ("Reservado") : "Disponível"}</td>
                  <td style={{ width: 260, textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        width: "100%",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        flexWrap: "nowrap",     // impede quebrar linha
                        whiteSpace: "nowrap",   // garante que os botões não quebrem texto
                      }}
                    >
                      <button
                        className="btn btn-ghost"
                        style={{ minWidth: 80 }}                   // opcional: largura mínima uniforme
                        onClick={() => navigate(`/livros/cadastrar?id=${l.id}`)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ minWidth: 80 }}                   // opcional
                        onClick={() => excluir(l)}
                      >
                        Excluir
                      </button>
                      <button
                        className="btn btn-success"
                        style={{ minWidth: 90 }}                   // opcional
                        disabled={reservado}
                        onClick={() => abrirModalReserva(l)}
                        title={reservado ? "Livro já está reservado" : "Reservar"}
                      >
                        Reservar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtrada.length === 0 && (
              <tr>
                <td colSpan={6}>Nenhum livro encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal de reserva */}
      {openModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
          onClick={fecharModal}
        >
          <div
            className="card"
            style={{ width: 520, maxWidth: "90vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Reservar livro</h3>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 14, opacity: 0.8 }}>Livro:</div>
              <div style={{ fontWeight: 600 }}>{alvoLivro?.titulo ?? "-"}</div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label
                style={{ fontSize: 14, opacity: 0.8, display: "block", marginBottom: 6 }}
              >
                Pessoa
              </label>
              <select
                className="input"
                value={selPessoa}
                onChange={(e) => setSelPessoa(e.target.value)}
              >
                <option value="">Selecione...</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            {msg && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "#3a1a20",
                  color: "#ffb3b8",
                }}
              >
                {msg}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={fecharModal} disabled={saving}>
                Fechar
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmarReserva}
                disabled={saving || !selPessoa}
              >
                {saving ? "Reservando..." : "Confirmar reserva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
