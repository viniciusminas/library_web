import { useEffect, useMemo, useState } from "react";
import * as ReservasAPI from "../../services/reservas";
import * as MultasAPI from "../../services/multas";
import type { Reserva } from "../../services/reservas";

const PRAZO_DIAS = 7;
const TAXA_DIA = 2.5;

function toDate(v?: string | null) {
  return v ? new Date(v) : new Date();
}
function diffDays(a: Date, b: Date) {
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/** Modal simples e consistente com o restante do app */
function ConfirmarDevolucaoModal(props: {
  open: boolean;
  livro?: string;
  pessoa?: string;
  atrasoDias?: number;
  multa?: number;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { open, livro, pessoa, atrasoDias, multa, loading, onConfirm, onClose } = props;
  if (!open) return null;

  const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const multaFmt = typeof multa === "number" ? fmt.format(multa) : "—";
  const atrasoTxt = typeof atrasoDias === "number" ? `${atrasoDias} dia(s)` : "—";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 520, maxWidth: "92vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Confirmar devolução</h3>

        <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
          {livro && (
            <div>
              <div style={{ opacity: 0.7 }}>Livro</div>
              <div style={{ fontWeight: 600 }}>{livro}</div>
            </div>
          )}
          {pessoa && (
            <div>
              <div style={{ opacity: 0.7 }}>Pessoa</div>
              <div style={{ fontWeight: 600 }}>{pessoa}</div>
            </div>
          )}

          <div
            style={{
              marginTop: 8,
              padding: "8px 10px",
              borderRadius: 8,
              background: "#222632",
              border: "1px solid #2c3242",
            }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span>
                <strong>Atraso:</strong> {atrasoTxt}
              </span>
              <span>
                <strong>Multa:</strong> {multaFmt}
              </span>
            </div>
            <div style={{ marginTop: 6, opacity: 0.8 }}>
              A multa será registrada automaticamente ao confirmar a devolução.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-warning" onClick={onConfirm} disabled={loading}>
            {loading ? "Devolvendo..." : "Confirmar devolução"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReservasConsultar() {
  const [lista, setLista] = useState<Reserva[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  // estado do modal de devolução
  const [devOpen, setDevOpen] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [alvo, setAlvo] = useState<Reserva | null>(null);
  const [devResumo, setDevResumo] = useState<{ atrasoDias: number; multa: number }>({
    atrasoDias: 0,
    multa: 0,
  });

  async function carregar() {
    setLoading(true);
    try {
      const data = await ReservasAPI.listar();
      setLista(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void carregar();
  }, []);

  const abertas = useMemo(() => lista.filter((r) => !r.dataFim), [lista]);

  const filtrada = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    const base = abertas;
    if (!q) return base;
    return base.filter(
      (r) =>
        (r.pessoa?.nome ?? "").toLowerCase().includes(q) ||
        (r.livro?.titulo ?? "").toLowerCase().includes(q)
    );
  }, [abertas, filtro]);

  /** Abre o modal calculando atraso/multa para a reserva selecionada */
  function abrirModalDevolucao(r: Reserva) {
    if (!r?.id) return;

    const agora = new Date();
    const inicio = toDate(r.dataIni ?? null);
    const previsao = new Date(inicio);
    previsao.setDate(previsao.getDate() + PRAZO_DIAS);

    const diasAtraso = Math.max(0, diffDays(agora, previsao));
    const valor = Number((diasAtraso * TAXA_DIA).toFixed(2));

    setAlvo(r);
    setDevResumo({ atrasoDias: diasAtraso, multa: valor });
    setDevOpen(true);
  }

  /** Confirma devolução (executa API, cria multa se necessário e faz rollback em erro) */
  async function confirmarDevolucao() {
    if (!alvo?.id) return;

    const pessoaId = alvo.pessoa?.id;
    if (!pessoaId) {
      alert("Reserva sem pessoa associada.");
      return;
    }

    setDevLoading(true);
    setBusyId(alvo.id);

    // criar multa ANTES e remover se devolver falhar
    let multaCriada: { id?: number } | null = null;
    try {
      if (devResumo.atrasoDias > 0 && devResumo.multa > 0) {
        multaCriada = await MultasAPI.criarMulta({
          pessoaId,
          reservaId: alvo.id,
          valor: devResumo.multa,
          descricao: `Atraso de ${devResumo.atrasoDias} dia(s)`,
          dataMulta: new Date().toISOString(),
          pago: false,
        });
      }

      await ReservasAPI.devolver(alvo.id);

      setLista((prev) => prev.filter((x) => x.id !== alvo.id));

      // fecha modal e limpa alvo
      setDevOpen(false);
      setAlvo(null);

      // re-sincroniza
      await carregar();
    } catch (err) {
      if (multaCriada?.id) {
        try {
          await MultasAPI.removerMulta(multaCriada.id);
        } catch {
          // ignora erro ao tentar remover multa criada
        }
      }
      const e: any = err;
      const msg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e?.message ||
        "Erro ao devolver.";
      alert(msg);
    } finally {
      setDevLoading(false);
      setBusyId(null);
    }
  }

  async function cancelar(r: Reserva) {
    if (!r.id) return;
    if (!window.confirm("Cancelar esta reserva?")) return;

    await ReservasAPI.cancelar(r.id);

    setLista((prev) => prev.filter((x) => x.id !== r.id));

    await carregar();
  }

  // Fechar modal com ESC
  useEffect(() => {
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") setDevOpen(false);
    }
    if (devOpen) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [devOpen]);

  return (
    <div className="card">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <input
          className="input"
          placeholder="Buscar por pessoa ou livro..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <button className="btn btn-ghost" onClick={() => setFiltro("")}>
          Limpar
        </button>
      </div>

      {loading ? (
        <p>Carregando…</p>
      ) : filtrada.length === 0 ? (
        <p>Nenhuma reserva encontrada.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pessoa</th>
              <th>Livro</th>
              <th>Início</th>
              <th style={{ width: 230 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrada.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.pessoa?.nome ?? "-"}</td>
                <td>{r.livro?.titulo ?? "-"}</td>
                <td>{toDate(r.dataIni ?? null).toLocaleString()}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="btn btn-warning"
                      onClick={() => abrirModalDevolucao(r)}
                      disabled={busyId === r.id}
                      title="Devolver"
                    >
                      {busyId === r.id ? "Devolvendo..." : "Devolver"}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => cancelar(r)}
                      disabled={busyId === r.id}
                    >
                      Cancelar
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de confirmação */}
      <ConfirmarDevolucaoModal
        open={devOpen}
        onClose={() => setDevOpen(false)}
        onConfirm={confirmarDevolucao}
        loading={devLoading}
        livro={alvo?.livro?.titulo}
        pessoa={alvo?.pessoa?.nome}
        atrasoDias={devResumo.atrasoDias}
        multa={devResumo.multa}
      />
    </div>
  );
}
