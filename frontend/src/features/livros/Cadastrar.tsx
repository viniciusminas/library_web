import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { criarLivro, atualizarLivro, buscarLivro } from "../../services/livros";
import type { Livro } from "../../types/Livro";

type FormState = {
  titulo: string;
  autor: string;
  ano: string; // string no input
};

export default function LivrosCadastrar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const idParam = params.get("id");

  const [form, setForm] = useState<FormState>({ titulo: "", autor: "", ano: "" });
  const [loading, setLoading] = useState<boolean>(!!idParam);
  const [saving, setSaving] = useState(false);
  const editMode = !!idParam;

  // Carrega dados quando é edição
  useEffect(() => {
    if (!idParam) return;
    (async () => {
      try {
        setLoading(true);
        const livro = await buscarLivro(Number(idParam));
        setForm({
          titulo: livro.titulo ?? "",
          autor: livro.autor ?? "",
          ano: String(livro.ano ?? ""),
        });
      } catch (e: any) {
        alert(e?.response?.data?.message || e?.message || "Falha ao carregar livro.");
      } finally {
        setLoading(false);
      }
    })();
  }, [idParam]);

  function onChange<K extends keyof FormState>(key: K, v: string) {
    setForm((s) => ({ ...s, [key]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);

      const payload: Partial<Livro> = {
        titulo: form.titulo.trim(),
        autor: form.autor.trim(),
        ano: form.ano ? Number(form.ano) : undefined,
      };

      if (editMode) {
        await atualizarLivro(Number(idParam), payload);
      } else {
        await criarLivro(payload as Omit<Livro, "id">);
      }

      navigate("/livros/consultar");
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Falha ao salvar livro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{editMode ? "Editar livro" : "Cadastrar livro"}</h2>

      {loading ? (
        <p>Carregando…</p>
      ) : (
        <form onSubmit={onSubmit} className="form" style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <label>
            <div>Título</div>
            <input
              className="input"
              value={form.titulo}
              onChange={(e) => onChange("titulo", e.target.value)}
              required
            />
          </label>

          <label>
            <div>Autor</div>
            <input
              className="input"
              value={form.autor}
              onChange={(e) => onChange("autor", e.target.value)}
              required
            />
          </label>

          <label>
            <div>Ano</div>
            <input
              className="input"
              value={form.ano}
              onChange={(e) => onChange("ano", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              maxLength={4}
              placeholder="ex.: 2020"
            />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/livros/consultar")}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
