import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { listarPessoas, criarPessoa, excluirPessoa } from "./services/pessoas";
import { Pessoa } from "./types/Pessoa";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  tel: z.string().optional(),            
  endereco: z.string().min(3, "Endereço é obrigatório"),
});
type FormData = z.infer<typeof schema>;

export default function PessoasPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const [lista, setLista] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function carregar() {
    try {
      setLoading(true);
      const data = await listarPessoas();
      setLista(data);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void carregar(); }, []);

  const onSubmit = async (data: FormData) => {
    setErro(null); setOk(null);
    try {
      const payload: Omit<Pessoa, "id"> = {
        nome: data.nome,
        email: data.email,
        tel: data.tel?.trim() ? data.tel : undefined,
        endereco: data.endereco,              
      };
      await criarPessoa(payload);
      setOk("Usuário cadastrado com sucesso!");
      reset();
      await carregar();
    } catch (e: any) {
      setErro(e?.response?.data ?? e?.message ?? "Falha ao salvar");
    }
  };

  async function handleExcluir(id?: number) {
    if (!id) return;
    if (!window.confirm("Excluir este usuário?")) return;
    try {
      await excluirPessoa(id);
      await carregar();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao excluir");
    }
  }

  return (
    <>
      <div className="card" style={{marginBottom:16}}>
        <h1 style={{marginTop:0}}>Cadastro de Usuários</h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{
          display:"grid", gap:14, gridTemplateColumns:"1fr 1fr", alignItems:"start"
        }}>
          <label>Nome completo
            <input className="input" {...register("nome")} placeholder="Ex.: Jill Valentine" />
            {!!errors.nome?.message && <small className="help">{String(errors.nome.message)}</small>}
          </label>

          <label>E-mail
            <input className="input" type="email" {...register("email")} placeholder="jill@raccoon.edu" />
            {!!errors.email?.message && <small className="help">{String(errors.email.message)}</small>}
          </label>

          <label>Telefone (opcional)
            <input className="input" {...register("tel")} placeholder="(11) 99999-9999" />
            {!!errors.tel?.message && <small className="help">{String(errors.tel.message)}</small>}
          </label>

          <label>Endereço
            <input className="input" {...register("endereco")} placeholder="Rua dos Governadores, 525" />
            {!!errors.endereco?.message && <small className="help">{String(errors.endereco.message)}</small>}
          </label>

          <div style={{gridColumn:"1 / -1"}}>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => reset()} style={{marginLeft:8}}>
              Limpar
            </button>
            {ok && <span style={{marginLeft:12,color:"#34d399"}}>{ok}</span>}
            {erro && <span style={{marginLeft:12,color:"#ff9aa2"}}>{erro}</span>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{marginTop:0}}>Usuários cadastrados</h2>
        {loading ? (
          <p>Carregando…</p>
        ) : lista.length === 0 ? (
          <p>Nenhum usuário.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Endereço</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nome}</td>
                  <td>{p.email}</td>
                  <td>{p.tel ?? "-"}</td>
                  <td>{p.endereco ?? "-"}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => handleExcluir(p.id!)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
