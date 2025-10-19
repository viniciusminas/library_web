import { useEffect, useMemo, useState } from "react";
import * as MultasAPI from "../../services/multas";
import type { Multa } from "../../types/Multa";

export default function MultasConsultar() {
  const [lista, setLista] = useState<Multa[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function carregar() {
    setLoading(true);
    try {
      const data = await MultasAPI.listarMultas();
      setLista(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void carregar(); }, []);

  const filtrada = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(m =>
      (m.pessoa?.nome ?? "").toLowerCase().includes(q) ||
      (m.reserva?.livro?.titulo ?? "").toLowerCase().includes(q)
    );
  }, [lista, filtro]);

  async function marcarPago(m: Multa, pago: boolean) {
    if (!m.id) return;

    const pessoaId = m.pessoa?.id;
    if (!pessoaId) {
      alert("Multa sem pessoa vinculada.");
      return;
    }

    try {
      setBusyId(m.id);

      const payload: Partial<MultasAPI.NovaMulta> = {
        pessoaId,                                   // number garantido
        reservaId: m.reserva?.id ?? undefined,      // nunca envie null
        valor: m.valor,
        descricao: m.descricao ?? "",
        dataMulta: m.dataMulta,
        pago
      };

      await MultasAPI.atualizarMulta(m.id, payload);
      await carregar();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e?.message || "Falha ao atualizar multa.";
      alert(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function excluir(m: Multa) {
    if (!m.id) return;
    if (!window.confirm("Excluir esta multa?")) return;
    await MultasAPI.removerMulta(m.id);
    await carregar();
  }

  return (
    <div className="card">
      <div className="filters" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Filtrar por pessoa ou livro..."
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
        <p>Nenhuma multa encontrada.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Pessoa</th><th>Livro</th>
              <th>Valor</th><th>Data</th><th>Status</th>
              <th style={{ width: 220 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrada.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.pessoa?.nome ?? "-"}</td>
                <td>{m.reserva?.livro?.titulo ?? "-"}</td>
                <td>R$ {m.valor.toFixed(2)}</td>
                <td>{new Date(m.dataMulta).toLocaleString()}</td>
                <td>{m.pago ? "Pago" : "Em aberto"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="btn btn-success"
                      disabled={busyId === m.id}
                      onClick={() => marcarPago(m, !m.pago)}
                      title={m.pago ? "Reabrir" : "Dar baixa"}
                    >
                      {busyId === m.id
                        ? "Salvando…"
                        : m.pago ? "Reabrir" : "Dar baixa"}
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={busyId === m.id}
                      onClick={() => excluir(m)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
