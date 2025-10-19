import { useEffect, useMemo, useState } from "react";
import { listarPessoas, excluirPessoa, atualizarPessoa } from "../../services/pessoas";
import { Pessoa } from "../../types/Pessoa";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  tel: z.string().optional(),
  endereco: z.string().min(3, "Endereço é obrigatório"),
});
type FormData = z.infer<typeof schema>;

export default function PessoasConsultar(){
  const [lista, setLista] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [q, setQ] = useState(""); // busca
  const [editId, setEditId] = useState<number | null>(null);

  // form da LINHA em edição
  const { register, handleSubmit, reset, formState:{errors, isSubmitting} } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function carregar(){
    try{
      setLoading(true);
      const data = await listarPessoas();
      setLista(data);
    }catch(e:any){
      setErro(e?.message ?? "Erro ao carregar");
    }finally{
      setLoading(false);
    }
  }
  useEffect(() => { void carregar(); }, []);

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if(!s) return lista;
    return lista.filter(p =>
      (p.nome?.toLowerCase().includes(s)) ||
      (p.email?.toLowerCase().includes(s)) ||
      (p.tel ?? "").toLowerCase().includes(s) ||
      (p.endereco ?? "").toLowerCase().includes(s)
    );
  }, [q, lista]);

  function startEdit(p: Pessoa){
    setEditId(p.id!);
    reset({
      nome: p.nome,
      email: p.email,
      tel: p.tel ?? "",
      endereco: p.endereco ?? "",
    });
  }
  function cancelEdit(){ setEditId(null); }

  const onSave = async (data: FormData) => {
    if(!editId) return;
    const payload: Omit<Pessoa,"id"> = {
      nome: data.nome,
      email: data.email,
      endereco: data.endereco,
      tel: data.tel?.trim() ? data.tel : undefined,
    };
    await atualizarPessoa(editId, payload);
    setEditId(null);
    await carregar();
  };

  async function handleExcluir(id?: number){
    if(!id) return;
    if(!window.confirm("Excluir este usuário?")) return;
    await excluirPessoa(id);
    await carregar();
  }

  return (
    <div className="card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center", marginBottom:12}}>
        <h2 style={{margin:0}}>Usuários cadastrados</h2>
        <input
          className="input" style={{maxWidth:320}}
          placeholder="Buscar por nome, e-mail, telefone, endereço"
          value={q} onChange={e => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Carregando…</p>
      ) : filtrados.length === 0 ? (
        <p>Nenhum registro.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Endereço</th><th style={{width:180}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>

                {/* Nome */}
                <td>
                  {editId === p.id ? (
                    <>
                      <input className="input" {...register("nome")} />
                      {!!errors.nome?.message && <small className="help">{String(errors.nome.message)}</small>}
                    </>
                  ) : p.nome}
                </td>

                {/* Email */}
                <td>
                  {editId === p.id ? (
                    <>
                      <input className="input" type="email" {...register("email")} />
                      {!!errors.email?.message && <small className="help">{String(errors.email.message)}</small>}
                    </>
                  ) : p.email}
                </td>

                {/* Telefone */}
                <td>
                  {editId === p.id ? (
                    <>
                      <input className="input" {...register("tel")} />
                      {!!errors.tel?.message && <small className="help">{String(errors.tel.message)}</small>}
                    </>
                  ) : (p.tel ?? "-")}
                </td>

                {/* Endereço */}
                <td>
                  {editId === p.id ? (
                    <>
                      <input className="input" {...register("endereco")} />
                      {!!errors.endereco?.message && <small className="help">{String(errors.endereco.message)}</small>}
                    </>
                  ) : (p.endereco ?? "-")}
                </td>

                <td>
                  {editId === p.id ? (
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-primary" onClick={handleSubmit(onSave)} disabled={isSubmitting}>
                        {isSubmitting ? "Salvando..." : "Salvar"}
                      </button>
                      <button className="btn btn-ghost" onClick={cancelEdit}>Cancelar</button>
                    </div>
                  ) : (
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-ghost" onClick={() => startEdit(p)}>Editar</button>
                      <button className="btn btn-ghost" onClick={() => handleExcluir(p.id!)}>Excluir</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {erro && <div style={{marginTop:10,color:"#ff9aa2"}}>{erro}</div>}
    </div>
  );
}
