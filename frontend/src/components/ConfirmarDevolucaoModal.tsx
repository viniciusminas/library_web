import React from "react";

type Props = {
  open: boolean;
  livro?: string;
  pessoa?: string;
  atrasoDias?: number;    
  multa?: number;          
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;   // chama a API de devolver
};

export default function ConfirmarDevolucaoModal({
  open, livro, pessoa, atrasoDias, multa, loading, onClose, onConfirm,
}: Props) {
  if (!open) return null;

  const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const multaFmt = typeof multa === "number" ? fmt.format(multa) : "—";
  const atrasoTxt = typeof atrasoDias === "number" ? `${atrasoDias} dia(s)` : "—";

  return (
    <div
      style={{
        position: "fixed", inset: 0, display: "grid", placeItems: "center",
        background: "rgba(0,0,0,0.55)", zIndex: 1000,
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
              marginTop: 8, padding: "8px 10px", borderRadius: 8,
              background: "#222632", border: "1px solid #2c3242",
            }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span><strong>Atraso:</strong> {atrasoTxt}</span>
              <span><strong>Multa:</strong> {multaFmt}</span>
            </div>
            <div style={{ marginTop: 6, opacity: 0.8 }}>
              A multa será registrada automaticamente ao confirmar a devolução.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn btn-warning" onClick={onConfirm} disabled={loading}>
            {loading ? "Devolvendo..." : "Confirmar devolução"}
          </button>
        </div>
      </div>
    </div>
  );
}
